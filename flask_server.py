from flask import Flask, jsonify, render_template
import threading
from google.cloud import storage
import os

from video import analyze_video
from audio import analyze_audio

# setting up google cloud
storage_client = storage.Client()
os.environ["GOOGLE_API_CREDENTIALS"] = r'./key.json'
    

threads = []

app = Flask(__name__)

video_path = "gs://hirehack-2024-data/video/video.mp4"
audio_path = "gs://hirehack-2024-data/audio/audio.wav"

def fer_model():
    return analyze_video.fer_model(video_path)

def voice_model():
    return analyze_audio.analyze_audio_file(audio_path)

def lexical_model():
    return {'result': 'lexical_model_result'}

# Dictionary to collect results from threads
results = {}

# Function to run all models in parallel
def run_all_models():
    fer_thread = threading.Thread(target=run_model, args=(fer_model, 'fer_model'))
    voice_thread = threading.Thread(target=run_model, args=(voice_model, 'voice_model'))
    lexical_thread = threading.Thread(target=run_model, args=(lexical_model, 'lexical_model'))
    
    threads = [fer_thread, voice_thread, lexical_thread]

    # Start all threads simultaneously
    fer_thread.start()
    voice_thread.start()
    lexical_thread.start()

    # Wait for all threads to finish
    fer_thread.join()
    voice_thread.join()
    lexical_thread.join()

# Route to trigger all model processing threads
@app.route("/process_all_models")
def process_all_models_route():
    run_all_models()
    return jsonify({'message': 'All model processing started in the background'})

# Route to display aggregated results
@app.route("/aggregated")
def aggregated_route():
    global threads
    # Wait for all threads to finish before displaying aggregated results
    # threads = threading.enumerate()
    for thread in threads:
        if thread != threading.current_thread():
            thread.join()

    #saving the json file
    

    # Display aggregated results
    return jsonify(results)

# Function to run a model in a separate thread
def run_model(model_func, model_name):
    result = model_func()
    results[model_name] = result
    
if __name__ == "__main__":
    app.run(host = "127.0.0.1", port = 8080, debug=True, threaded=True)




