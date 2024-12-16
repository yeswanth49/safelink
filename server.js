const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const QRCode = require('qrcode');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static('.')); // Serve files from the current directory

// Database (JSON file)
const DATABASE_PATH = path.join(__dirname, 'database.json');
const PUBLIC_DIR = path.join(__dirname, 'public');
const VIEWS_DIR = path.join(__dirname, 'views');

// Ensure necessary directories and files exist
const initializeApp = async () => {
    try {
        // Ensure public directory exists
        await fs.ensureDir(PUBLIC_DIR);
        
        // Ensure views directory exists
        await fs.ensureDir(VIEWS_DIR);
        
        // Ensure database file exists
        if (!await fs.pathExists(DATABASE_PATH)) {
            await fs.writeJson(DATABASE_PATH, []);
        }
        
        // Create view.html if it doesn't exist
        const viewHtmlPath = path.join(VIEWS_DIR, 'view.html');
        if (!await fs.pathExists(viewHtmlPath)) {
            await fs.writeFile(viewHtmlPath, `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Contact Details</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; }
        .contact-card { background-color: #f4f4f4; padding: 20px; border-radius: 8px; }
    </style>
</head>
<body>
    <div class="contact-card">
        <h1>Contact Details</h1>
        <div id="contactDetails">Loading...</div>
    </div>

    <script>
        const contactId = window.location.pathname.split('/').pop();
        fetch(\`/api/contact/\${contactId}\`)
            .then(response => response.json())
            .then(contact => {
                const detailsHtml = \`
                    <p><strong>Name:</strong> \${contact.name}</p>
                    <p><strong>Phone:</strong> \${contact.phone}</p>
                    <p><strong>Email:</strong> \${contact.email}</p>
                    \${contact.website !== 'N/A' ? \`<p><strong>Website:</strong> <a href="\${contact.website}" target="_blank">\${contact.website}</a></p>\` : ''}
                \`;
                document.getElementById('contactDetails').innerHTML = detailsHtml;
            })
            .catch(error => {
                document.getElementById('contactDetails').innerHTML = 'Error loading contact details';
                console.error('Error:', error);
            });
    </script>
</body>
</html>
            `);
        }

        // Ensure public directory for QR codes
        const qrDir = path.join(PUBLIC_DIR, 'qr-codes');
        await fs.ensureDir(qrDir);
    } catch (error) {
        console.error('Initialization error:', error);
    }
};
app.use((req, res, next) => {
    // Logging middleware to debug incoming requests
    console.log('Incoming request:', {
        method: req.method,
        path: req.path,
        body: req.body,
        headers: req.headers
    });
    next();
});

// Ensure JSON parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/generate-qr', async (req, res) => {
    try {
        console.log('Generate QR Route - Received body:', req.body);

        // Additional logging for body parsing
        const { name, phone, email, website } = req.body;
        
        console.log('Parsed body:', {
            name, 
            phone, 
            email, 
            website
        });

        // Validate input
        if (!name || !phone || !email) {
            console.error('Missing required fields');
            return res.status(400).json({ 
                error: 'Missing required fields',
                details: {
                    name: !!name,
                    phone: !!phone,
                    email: !!email
                }
            });
        }
        
        // Generate unique ID
        const uniqueId = uuidv4().split('-')[0];
        
        // Prepare contact data
        const contactData = {
            id: uniqueId,
            name,
            phone,
            email,
            website: website || 'N/A',
            createdAt: new Date().toISOString()
        };

        // Read existing database
        let database = await fs.readJson(DATABASE_PATH);
        
        // Add new contact
        database.push(contactData);
        
        // Write back to database
        await fs.writeJson(DATABASE_PATH, database);

        // Generate QR Code
        const qrCodeUrl = await generateQRCode(uniqueId);

        // Construct view URL
        const viewUrl = `http://localhost:${PORT}/view/${uniqueId}`;

        console.log('Sending response:', {
            qrCodeUrl,
            viewUrl,
            uniqueId
        });

        // Explicitly set content type and send JSON
        res.contentType('application/json');
        res.status(200).json({
            qrCodeUrl,
            viewUrl,
            uniqueId
        });
    } catch (error) {
        console.error('FULL QR Code Generation Error:', {
            message: error.message,
            stack: error.stack,
            name: error.name
        });

        // Ensure JSON response even for errors
        res.contentType('application/json');
        res.status(500).json({ 
            error: 'Failed to generate QR Code',
            details: error.message,
            stack: error.stack
        });
    }
});

// Debugging Routes with Extensive Logging

app.get('/view/:id', async (req, res) => {
    try {
        const database = await fs.readJson(DATABASE_PATH);
        const contact = database.find(c => c.id === req.params.id.replace(/[{}]/g, '')); // Add .replace here

        if (!contact) {
            return res.status(404).send('Contact not found');
        }

        // Send HTML view
        res.sendFile(path.join(VIEWS_DIR, 'view.html'));
    } catch (error) {
        console.error('Error in view route:', error);
        res.status(500).send('Unexpected error retrieving contact');
    }
});

app.get('/api/contact/:id', async (req, res) => {
    try {
        const database = await fs.readJson(DATABASE_PATH);
        const contact = database.find(c => c.id === req.params.id.replace(/[{}]/g, '')); // Add .replace here

        if (!contact) {
            return res.status(404).json({ error: 'Contact not found' });
        }

        res.json(contact);
    } catch (error) {
        res.status(500).json({ error: 'Error retrieving contact' });
    }
});

// Debugging route to list all contacts
app.get('/debug/contacts', async (req, res) => {
    try {
        const database = await fs.readJson(DATABASE_PATH);
        res.json(database);
    } catch (error) {
        console.error('Error listing contacts:', error);
        res.status(500).json({ error: 'Could not list contacts' });
    }
});

// API to get contact details
app.get('/api/contact/:id', async (req, res) => {
    try {
        const database = await fs.readJson(DATABASE_PATH);
        const contact = database.find(c => c.id === req.params.id);

        if (!contact) {
            return res.status(404).json({ error: 'Contact not found' });
        }

        res.json(contact);
    } catch (error) {
        res.status(500).json({ error: 'Error retrieving contact' });
    }
});

// QR Code Generation Function
async function generateQRCode(uniqueId) {
    // Ensure the directory exists
    const qrDir = path.join(PUBLIC_DIR, 'qr-codes');
    await fs.ensureDir(qrDir);

    // Generate full path for QR code
    const qrCodePath = path.join(qrDir, `qr-${uniqueId}.png`);
    
    // Generate QR code
    await QRCode.toFile(qrCodePath, `http://localhost:${PORT}/view/${uniqueId}`, {
        errorCorrectionLevel: 'H'
    });

    // Return relative path for client-side usage
    return `/qr-codes/qr-${uniqueId}.png`;
}

// Initialize the application
initializeApp();

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});