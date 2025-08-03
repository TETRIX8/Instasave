from flask import Flask, request, jsonify
from flask_cors import CORS
import sys
import os
import traceback

# Add the parent directory to the path so we can import snapsave_downloader
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from snapsave_downloader import SnapSave

app = Flask(__name__)
CORS(app)

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
    app.run() 