from model.model import DaModel
import torch
import torch.nn as nn
import json

import requests

API_URL = "https://api-inference.huggingface.co/models/HuggingFaceH4/zephyr-7b-beta"
headers = {"Authorization": "Bearer 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"}

def query(payload):
	response = requests.post(API_URL, headers=headers, json=payload)
	return response.json()

def run_damodel():
    model = DaModel()
    model.load_state_dict(torch.load('model/model.pt'))

    response = model.process('/home/vamsi/Downloads/test_video.webm', '/home/vamsi/Downloads/test_audio.webm', '/home/vamsi/Downloads/transcript.txt') if not None else {}
    
    dump = json.dumps(response)
    print(dump)
    
    output = query({
        "inputs": "<|instructions|>\nAct like a professional career counselor assisting a student in the middle of their interview. To provide recommendations, you will use the provided JSON string. The JSON string contains information on how each feature should be changed to improve the student's performance. If a feature has a positive value, it is recommended to increase that feature. If a feature has a negative value, it is recommended to decrease that feature. Using the JSON string, come up with short bullets detailing what the student should change in their interview. Make sure the suggestions are sensible and understandable by a human. Do not show any numbers in the suggestions. Here is the JSON string:\n" +
        dump + "\n<|recommendations|>"
    })
    
    recs = output[0]["generated_text"].split("<|recommendations|>")[1]
    
    print(output)
    
    print(recs)
    
    return recs
