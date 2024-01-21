from model.model import DaModel
import torch
import torch.nn as nn
import json

import requests

API_URL = "https://api-inference.huggingface.co/models/mistralai/Mixtral-8x7B-v0.1"
headers = {"Authorization": "Bearer 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"}

def query(payload):
	response = requests.post(API_URL, headers=headers, json=payload)
	return response.json()
	
output = query({
	"inputs": "Can you please let us know more details about your ",
})

def run_damodel():
    model = DaModel()
    model.load_state_dict(torch.load('model/model.pt'))

    response = model.process('/home/vamsi/Downloads/test_video.webm', '/home/vamsi/Downloads/test_audio.webm', '/home/vamsi/Downloads/transcript.txt') if not None else {}
    
    dump = json.dumps(response)
    print(dump)
    
    return dump
