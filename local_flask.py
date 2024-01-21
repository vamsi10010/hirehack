from flask import Flask, send_file

app_local = Flask(__name__)

@app_local.route('/get_file/<filename>')
def get_file(filename):
    file_path = 'path' + filename
    return send_file(file_path, as_attachment=True)
