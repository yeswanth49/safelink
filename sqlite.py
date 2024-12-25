from flask import Flask, render_template, request, redirect, url_for, send_file
import sqlite3
import qrcode
import io
import base64
import secrets
from datetime import datetime

app = Flask(__name__)

def init_db():
    """Initialize the SQLite database and create tables if they don't exist"""
    conn = sqlite3.connect('profiles.db')
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS profiles (
            id TEXT PRIMARY KEY,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            name TEXT NOT NULL,
            blood_group TEXT,
            template TEXT,
            phone TEXT,
            password TEXT,
            emergency_contact TEXT,
            medical_conditions TEXT,
            allergies TEXT,
            medications TEXT
        )
    ''')
    conn.commit()
    conn.close()

def get_db():
    """Get database connection"""
    conn = sqlite3.connect('profiles.db')
    conn.row_factory = sqlite3.Row  # This enables name-based access to columns
    return conn

# Initialize the database when the app is created
with app.app_context():
    init_db()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/select_template/<template_name>')
def select_template(template_name):
    return render_template('profile_form.html', template=template_name)

@app.route('/generate_profile', methods=['POST'])
def generate_profile():
    # Generate a secure random ID
    profile_id = secrets.token_hex(16)
    
    conn = get_db()
    try:
        conn.execute('''
            INSERT INTO profiles (
                id, name, phone, blood_group, template, password,
                emergency_contact, medical_conditions, allergies, medications
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            profile_id,
            request.form['name'],
            request.form['phone'],
            request.form['blood_group'],
            request.form['template'],
            request.form['password'],
            request.form.get('emergency_contact'),
            request.form.get('medical_conditions'),
            request.form.get('allergies'),
            request.form.get('medications')
        ))
        conn.commit()
        
        # Generate QR code with just the profile ID
        profile_url = url_for('view_profile', 
                            profile_id=profile_id,
                            _external=True)
        
        # Create QR code in memory
        qr = qrcode.QRCode(version=1, box_size=10, border=5)
        qr.add_data(profile_url)
        qr.make(fit=True)
        qr_image = qr.make_image(fill_color="black", back_color="white")
        
        # Convert QR code to base64 for displaying in HTML
        buffered = io.BytesIO()
        qr_image.save(buffered, format="PNG")
        qr_base64 = base64.b64encode(buffered.getvalue()).decode()
        
        return render_template('qr_display.html', 
                             qr_base64=qr_base64, 
                             profile_id=profile_id)
                             
    except Exception as e:
        print(f"Error: {e}")
        return "Error creating profile", 500
    finally:
        conn.close()

@app.route('/profile/<profile_id>')
def view_profile(profile_id):
    conn = get_db()
    try:
        profile = conn.execute(
            'SELECT * FROM profiles WHERE id = ?', 
            (profile_id,)
        ).fetchone()
        
        if profile is None:
            return "Profile not found", 404
            
        # Check for password if provided
        provided_password = request.args.get('password')
        show_sensitive = provided_password and provided_password == profile['password']
        
        return render_template('profile_view.html', 
                             profile=dict(profile),  # Convert Row to dict
                             show_sensitive=show_sensitive)
    finally:
        conn.close()

@app.route('/download_qr/<profile_id>')
def download_qr(profile_id):
    conn = get_db()
    try:
        # Verify profile exists
        profile = conn.execute(
            'SELECT id FROM profiles WHERE id = ?', 
            (profile_id,)
        ).fetchone()
        
        if profile is None:
            return "Profile not found", 404
            
        # Generate QR code
        profile_url = url_for('view_profile', 
                            profile_id=profile_id,
                            _external=True)
        
        qr = qrcode.QRCode(version=1, box_size=10, border=5)
        qr.add_data(profile_url)
        qr.make(fit=True)
        qr_image = qr.make_image(fill_color="black", back_color="white")
        
        # Save to BytesIO object
        img_io = io.BytesIO()
        qr_image.save(img_io, 'PNG')
        img_io.seek(0)
        
        return send_file(
            img_io,
            mimetype='image/png',
            as_attachment=True,
            download_name=f"qr_code_{profile_id}.png"
        )
    except Exception as e:
        print(f"Download error: {e}")
        return "Error generating QR code", 500
    finally:
        conn.close()

if __name__ == '__main__':
    app.run(debug=True)