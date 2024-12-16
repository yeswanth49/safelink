document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contactForm');
    const qrCodeImage = document.getElementById('qrCodeImage');
    const qrCodeLink = document.getElementById('qrCodeLink');

    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Reset previous state
        qrCodeImage.style.display = 'none';
        qrCodeLink.innerHTML = '';

        // Collect form data
        const formData = new FormData(contactForm);
        const data = Object.fromEntries(formData.entries());

        try {
            console.log('Sending data:', JSON.stringify(data, null, 2));

            // Send data to server
            const response = await fetch('/generate-qr', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(data)
            });

            console.log('Response status:', response.status);
            console.log('Response headers:', Object.fromEntries(response.headers.entries()));
            
            // Get response text for debugging
            const responseText = await response.text();
            console.log('Raw response text:', responseText);

            // Try to parse as JSON
            let result;
            try {
                result = JSON.parse(responseText);
            } catch (parseError) {
                console.error('JSON Parsing Error:', parseError);
                throw new Error(`Failed to parse JSON. Response was: ${responseText}`);
            }

            console.log('Parsed result:', result);

            // Check for error in result
            if (result.error) {
                throw new Error(result.error);
            }

            if (result.qrCodeUrl && result.viewUrl) {
                // Display QR Code
                qrCodeImage.src = result.qrCodeUrl;
                qrCodeImage.style.display = 'block';
                
                // Display view link
                qrCodeLink.innerHTML = `View Contact: <a href="${result.viewUrl}" target="_blank">${result.viewUrl}</a>`;
            } else {
                throw new Error('Invalid response format');
            }
        } catch (error) {
            console.error('FULL Error generating QR Code:', {
                message: error.message,
                stack: error.stack,
                name: error.name
            });
            
            alert(error.message || 'Failed to generate QR Code');
        }
    });
});