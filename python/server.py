from flask import Flask, request, jsonify
from manga_ocr import MangaOcr
from deep_translator import GoogleTranslator
from PIL import Image
import base64
import io
import sys

app = Flask(__name__)

print('Cargando modelo manga-ocr...', flush=True)
ocr = MangaOcr()
print('manga-ocr ready', flush=True)


@app.route('/health')
def health():
    return jsonify({'status': 'ok'})


@app.route('/ocr', methods=['POST'])
def run_ocr():
    try:
        data = request.get_json()
        image_b64 = data['image'].split(',')[1]
        image_bytes = base64.b64decode(image_b64)
        image = Image.open(io.BytesIO(image_bytes))
        text = ocr(image)
        return jsonify({'text': text})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/translate', methods=['POST'])
def translate():
    try:
        data = request.get_json()
        text = data['text']
        lang = data.get('lang', 'es')
        translated = GoogleTranslator(source='auto', target=lang).translate(text)
        return jsonify({'text': translated})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5001, debug=False)
