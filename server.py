from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import sys
import traceback
from snapsave_downloader import SnapSave

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Serve static files
@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:filename>')
def static_files(filename):
    return send_from_directory('.', filename)

@app.route('/api/download', methods=['POST'])
def download_video():
    try:
        data = request.get_json()
        
        if not data or 'url' not in data:
            return jsonify({'error': 'URL is required'}), 400
        
        video_url = data['url']
        
        # Validate URL
        if not video_url or not (video_url.startswith('https://www.instagram.com') or 
                                video_url.startswith('https://instagram.com') or
                                video_url.startswith('https://fb.watch')):
            return jsonify({'error': 'Invalid URL format'}), 400
        
        # Call your existing SnapSave function
        download_url = SnapSave(video_url)
        
        if download_url:
            return jsonify({
                'success': True,
                'downloadUrl': download_url,
                'message': 'Download link generated successfully'
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Could not generate download link. Please try with a different URL.'
            }), 400
            
    except Exception as e:
        print(f"Error processing download: {str(e)}")
        print(traceback.format_exc())
        return jsonify({
            'success': False,
            'error': 'Internal server error. Please try again later.'
        }), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'message': 'A-K Project Instagram Downloader is running'})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False) 