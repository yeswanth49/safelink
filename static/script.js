// Improved script.js for Contact QR Code Generator
document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contactForm');
    const qrCodeSection = document.getElementById('qrCodeSection');
    const qrCodeImage = document.getElementById('qrCodeImage');
    const qrCodeLink = document.getElementById('qrCodeLink');
    const errorMessage = document.getElementById('errorMessage');

    // UI Helper Functions
    const resetUI = () => {
        qrCodeSection.classList.add('hidden');
        errorMessage.textContent = '';
        errorMessage.classList.add('hidden');
    };

    const showError = (message) => {
        errorMessage.textContent = message;
        errorMessage.classList.remove('hidden');
    };

    const showQRCode = (qrCodeUrl, viewUrl) => {
        qrCodeImage.src = qrCodeUrl;
        qrCodeLink.innerHTML = `
            <a href="${viewUrl}" target="_blank" class="text-blue-600 hover:underline">
                View Contact Details
            </a>
        `;
        qrCodeSection.classList.remove('hidden');
    };

    // Form Validation
    const validateForm = (formData) => {
        const errors = [];

        // Name validation
        if (!formData.name || formData.name.trim().length < 2) {
            errors.push('Name must be at least 2 characters long');
        }

        // Email validation (more comprehensive)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email || !emailRegex.test(formData.email)) {
            errors.push('Please enter a valid email address');
        }

        // Phone validation
        const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
        if (!formData.phone || !phoneRegex.test(formData.phone)) {
            errors.push('Please enter a valid phone number');
        }

        return errors;
    };

    // QR Code Generation Handler
    const generateQRCode = async (formData) => {
        try {
            const response = await fetch('/generate-qr', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            // Handle non-200 responses
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.details 
                    ? Object.values(errorData.details).join(', ') 
                    : 'Failed to generate QR Code');
            }

            const result = await response.json();

            // Validate response structure
            if (!result.qrCodeUrl || !result.viewUrl) {
                throw new Error('Invalid server response');
            }

            return result;
        } catch (error) {
            console.error('QR Code Generation Error:', error);
            throw error;
        }
    };

    // Form Submission Handler
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        resetUI();

        // Collect form data
        const formData = Object.fromEntries(new FormData(contactForm));

        try {
            // Client-side validation
            const validationErrors = validateForm(formData);
            if (validationErrors.length > 0) {
                throw new Error(validationErrors.join('. '));
            }

            // Generate QR Code
            const result = await generateQRCode(formData);

            // Show QR Code
            showQRCode(result.qrCodeUrl, result.viewUrl);

            // Optional: Clear form after successful submission
            contactForm.reset();
        } catch (error) {
            showError(error.message || 'An unexpected error occurred');
        }
    });
});