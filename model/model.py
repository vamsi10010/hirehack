import torch
import torch.nn as nn
from torch.autograd import Variable
import matplotlib.pyplot as plt
import pandas as pd

from .audio.analyze_audio import analyze_audio_file
from .video.analyze_video import fer_video
from .lexical.lexical_analysis import calc_score

lexlabels = ['neg', 'neu', 'pos', 'compound']

audlabels = ['number_of_syllables',
 'number_of_pauses',
 'rate_of_speech',
 'articulation_rate',
 'speaking_duration',
 'original_duration',
 'balance',
 'f0_mean',
 'f0_std',
 'f0_median',
 'f0_min',
 'f0_max',
 'f0_quantile25',
 'f0_quan75']

vidlabels = ['angry', 'disgust', 'fear', 'happy', 'sad', 'surprise', 'neutral']

labels = vidlabels + audlabels + lexlabels

class DaModel(nn.Module):
    def __init__(self, *args, **kwargs) -> None:
        super().__init__(*args, **kwargs)
        self.model = nn.Sequential(
            nn.Linear(25, 1024),
            nn.ReLU(),
            nn.Linear(1024, 32),
            nn.ReLU(),
            nn.Linear(32, 1)
        )
        
    def forward(self, x):
        return self.model(x)
    
    def process(self, video, audio, transcript):
        facial_output = fer_video(video)
        audio_output = analyze_audio_file(audio)
        lexical_output = calc_score(transcript)
        
        try:
            output = torch.tensor(list(facial_output.values()) + list(audio_output.values()) + list(lexical_output.values()))
        except:
            print(f"Error processing")
            return None
        
        output = Variable(output, requires_grad=True)
        
        self.zero_grad()
        
        loss_fn = nn.MSELoss()
        loss = loss_fn(self(output), torch.tensor([9], dtype=torch.float32))
        
        loss.backward()
        rec_vector = -output.grad;
        
        # put labels and values into a dictionary
        recs = {k: v.item() for k, v in zip(labels, rec_vector)}
        
        return recs
        