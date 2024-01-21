from model.model import DaModel
import torch
import torch.nn as nn
import jsonify


def run_damodel():
    model = DaModel()
    model.load_state_dict(torch.load('model/model.pt'))

    response = model.process('~/Downloads/temp_video.webm', '~/Downloads/temp_audio.webm', '~/Downloads/transcript.txt')
    return jsonify(response)
