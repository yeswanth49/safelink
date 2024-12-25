from flask import Flask, render_template, request, redirect, url_for, send_file
import qrcode
import json
import io
import base64

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/select_template/<template_name>')
def select_template(template_name):
    return render_template('profile_form.html', template=template_name)

@app.route('/generate_profile', methods=['POST'])
def generate_profile():
    profile_data = {
        'name': request.form['name'],
        'phone': request.form['phone'],
        'blood_group': request.form['blood_group'],
        'template': request.form['template'],
        'password': request.form['password']
    }
    
    # Generate unique ID for profile
    profile_id = str(hash(frozenset(profile_data.items())))
    
    # Generate QR code
    profile_url = url_for('view_profile', 
                         profile_id=profile_id,
                         **profile_data,  # Pass data as URL parameters
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

@app.route('/profile/<profile_id>')
def view_profile(profile_id):
    # Get profile data from URL parameters instead of file
    profile_data = {
        'name': request.args.get('name'),
        'phone': request.args.get('phone'),
        'blood_group': request.args.get('blood_group'),
        'template': request.args.get('template'),
        'password': request.args.get('password')
    }
    
    # Check if we have all required data
    if not all(profile_data.values()):
        return "Profile not found", 404
        
    return render_template('profile_view.html', profile=profile_data)

@app.route('/download_qr')
def download_qr():
    try:
        # Generate QR code on-the-fly
        profile_data = {
            'name': request.args.get('name'),
            'phone': request.args.get('phone'),
            'blood_group': request.args.get('blood_group'),
            'template': request.args.get('template'),
            'password': request.args.get('password')
        }
        
        profile_id = str(hash(frozenset(profile_data.items())))
        profile_url = url_for('view_profile', 
                            profile_id=profile_id,
                            **profile_data,
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

if __name__ == '__main__':
    app.run(debug=True)