from flask import Flask, render_template, request, redirect, url_for, send_file
import qrcode
import json
import os
from pathlib import Path

app = Flask(__name__)
STORAGE_DIR = Path("static/profiles")
STORAGE_DIR.mkdir(exist_ok=True)


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
    
    # Save profile data
    with open(STORAGE_DIR / f"{profile_id}.json", 'w') as f:
        json.dump(profile_data, f)
    
    # Generate QR code
    profile_url = url_for('view_profile', profile_id=profile_id, _external=True)
    qr = qrcode.QRCode(version=1, box_size=10, border=5)
    qr.add_data(profile_url)
    qr.make(fit=True)
    qr_image = qr.make_image(fill_color="black", back_color="white")
    qr_image.save(STORAGE_DIR / f"{profile_id}_qr.png")
    
    return render_template('qr_display.html', profile_id=profile_id)

@app.route('/profile/<profile_id>')
def view_profile(profile_id):
    try:
        with open(STORAGE_DIR / f"{profile_id}.json") as f:
            profile_data = json.load(f)
        return render_template('profile_view.html', profile=profile_data)
    except FileNotFoundError:
        return "Profile not found", 404
    
@app.route('/profiles/<path:filename>')
def serve_qr(filename):
    return send_from_directory('profiles', filename)

@app.route('/download/<profile_id>')
def download_qr(profile_id):
    try:
        file_path = STORAGE_DIR / f"{profile_id}_qr.png"
        if file_path.exists():
            return send_file(
                file_path,
                mimetype='image/png',
                as_attachment=True,
                download_name=f"qr_code_{profile_id}.png"
            )
        return "QR code not found", 404
    except Exception as e:
        print(f"Download error: {e}")  # For debugging
        return "Error downloading file", 500

if __name__ == '__main__':
    app.run(debug=True)