import os
import json
import uuid
import re
from datetime import datetime
import logging

from flask import Flask, request, render_template, jsonify, send_from_directory
from flask_cors import CORS
import qrcode

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# Ensure necessary directories exist
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
QR_CODE_DIR = os.path.join(BASE_DIR, 'static', 'qr_codes')
os.makedirs(QR_CODE_DIR, exist_ok=True)

# Database path
DATABASE_PATH = os.path.join(BASE_DIR, 'database.json')

def validate_email(email):
    """Validate email format"""
    email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(email_regex, email) is not None

def validate_phone(phone):
    """Validate phone number format"""
    # Remove any spaces, dashes, or parentheses
    cleaned_phone = re.sub(r'[\s\-\(\)]', '', phone)
    # Check if it's a valid phone number (10-15 digits)
    return re.match(r'^\+?1?\d{10,15}$', cleaned_phone) is not None

def validate_website(website):
    """Validate website URL (optional)"""
    if not website or website.strip() == '':
        return True
    website_regex = r'^(https?://)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(/.*)?$'
    return re.match(website_regex, website) is not None

def initialize_database():
    """Ensure database file exists"""
    try:
        if not os.path.exists(DATABASE_PATH):
            with open(DATABASE_PATH, 'w') as f:
                json.dump([], f)
        logger.info("Database initialized successfully")
    except IOError as e:
        logger.error(f"Failed to initialize database: {e}")
        raise

def read_database():
    """Read contacts from database"""
    try:
        with open(DATABASE_PATH, 'r') as f:
            contacts = json.load(f)
        logger.debug(f"Read {len(contacts)} contacts from database")
        return contacts
    except (IOError, json.JSONDecodeError) as e:
        logger.error(f"Error reading database: {e}")
        return []

def write_database(contacts):
    """Write contacts to database"""
    try:
        with open(DATABASE_PATH, 'w') as f:
            json.dump(contacts, f, indent=4)
        logger.info(f"Wrote {len(contacts)} contacts to database")
    except IOError as e:
        logger.error(f"Failed to write to database: {e}")
        raise

def generate_qr_code(unique_id):
    """Generate QR code for a contact"""
    try:
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_H,
            box_size=10,
            border=4,
        )
        qr.add_data(f'http://localhost:5000/view/{unique_id}')
        qr.make(fit=True)

        img = qr.make_image(fill_color="black", back_color="white")
        qr_filename = f'qr-{unique_id}.png'
        qr_filepath = os.path.join(QR_CODE_DIR, qr_filename)
        img.save(qr_filepath)

        logger.info(f"QR Code generated for contact {unique_id}")
        return f'/static/qr_codes/{qr_filename}'
    except Exception as e:
        logger.error(f"QR Code generation failed: {e}")
        raise

# CORS and Preflight handling
@app.after_request
def add_cors_headers(response):
    """Add CORS headers to all responses"""
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Methods'] = 'POST, GET, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization'
    return response

@app.route('/generate-qr', methods=['POST', 'OPTIONS'])
def generate_qr():
    """Generate contact QR code with comprehensive validation"""
    # Handle OPTIONS request for CORS preflight
    if request.method == 'OPTIONS':
        return jsonify({'message': 'Preflight check'}), 200

    # Log request details for debugging
    logger.debug(f"Request headers: {request.headers}")
    logger.debug(f"Request content type: {request.content_type}")

    # Ensure JSON content type
    if not request.is_json:
        logger.error("Invalid content type. Expected application/json")
        return jsonify({
            'error': 'Invalid content type',
            'message': 'Request must be application/json'
        }), 415

    try:
        # Attempt to get JSON data
        data = request.get_json(force=True)
        logger.info(f"Received data: {data}")

        # Comprehensive validation
        errors = {}

        # Validate name
        name = data.get('name', '').strip()
        if not name:
            errors['name'] = 'Name is required'
        elif len(name) < 2 or len(name) > 100:
            errors['name'] = 'Name must be between 2 and 100 characters'

        # Validate phone
        phone = data.get('phone', '').strip()
        if not phone:
            errors['phone'] = 'Phone number is required'
        elif not validate_phone(phone):
            errors['phone'] = 'Invalid phone number format'

        # Validate email
        email = data.get('email', '').strip()
        if not email:
            errors['email'] = 'Email is required'
        elif not validate_email(email):
            errors['email'] = 'Invalid email format'

        # Validate website (optional)
        website = data.get('website', '').strip()
        if website and not validate_website(website):
            errors['website'] = 'Invalid website URL'

        # If any validation errors, return them
        if errors:
            logger.warning(f"Validation errors: {errors}")
            return jsonify({
                'error': 'Validation failed',
                'details': errors
            }), 400

        # Generate unique ID
        unique_id = str(uuid.uuid4()).split('-')[0]

        # Prepare contact data
        contact_data = {
            'id': unique_id,
            'name': name,
            'phone': phone,
            'email': email,
            'website': website or 'N/A',
            'created_at': str(datetime.now())
        }

        # Read existing contacts
        contacts = read_database()
        
        # Add new contact
        contacts.append(contact_data)
        
        # Write back to database
        write_database(contacts)

        # Generate QR Code
        qr_code_url = generate_qr_code(unique_id)
        view_url = f'http://localhost:5000/view/{unique_id}'

        # Log successful generation
        logger.info(f"Successfully generated QR code for {name}")

        return jsonify({
            'qrCodeUrl': qr_code_url,
            'viewUrl': view_url,
            'uniqueId': unique_id,
            'message': 'Contact QR code generated successfully'
        }), 200

    except json.JSONDecodeError:
        logger.error("Failed to decode JSON")
        return jsonify({
            'error': 'Invalid JSON',
            'message': 'Request body must be valid JSON'
        }), 400
    except Exception as e:
        # Catch-all for any unexpected errors
        logger.error(f"Unexpected error in generate-qr: {e}", exc_info=True)
        return jsonify({
            'error': 'Internal Server Error',
            'message': str(e)
        }), 500

# Other routes remain the same as in previous implementation

if __name__ == '__main__':
    # Initialize database
    initialize_database()
    
    # Run the app with debug mode
    app.run(debug=True, host='0.0.0.0', port=5000)