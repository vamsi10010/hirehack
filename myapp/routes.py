from flask import Blueprint, redirect, url_for, jsonify, render_template
import threading
import os
import requests

from video import analyze_video
from audio import analyze_audio
from lexical import lexical_analysis

threads = []

main = Blueprint('main', __name__)

from google.cloud import storage

def getData(bucket_name, path):
    storage_client = storage.Client()

    bucket = storage_client.bucket(bucket_name)

    blobs = bucket.list_blobs()

    files = {}
    for blob in blobs:
        if blob.name.endswith('.webm'):
            local_path = f"{path}/{blob.name}"
            blob.download_to_filename(local_path)
            files[blob.name] = local_path

    return files

local_app_url = "http://localhost:5000"
file_to_request = "file name"
response = requests.get(f"{local_app_url}/get_file/{file_to_request}")
response.content

def fer_model():
    return analyze_video.fer_model(video_path)

def voice_model():
    return analyze_audio.analyze_audio_file(audio_path)

def lexical_model():
    return lexical_analysis.calc_score()

# Function to run a model in a separate thread
def run_model(model_func, model_name):
    result = model_func()
    results[model_name] = result
    

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

@main.route("/")
def index():
    # run_all_models()
    return jsonify({'message': 'All model processing started in the background'})

@main.route("/aggregated")
def aggregated_route():
    global threads
    # Wait for all threads to finish before displaying aggregated results
    # threads = threading.enumerate()
    for thread in threads:
        if thread != threading.current_thread():
            thread.join()

    # Display aggregated results
    return jsonify(results)