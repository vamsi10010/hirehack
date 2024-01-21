from . import vaderSentiment as vader
from . import speech_to_text as stt

analyzer = vader.SentimentIntensityAnalyzer()

def calc_score(transcript):
    with open(transcript, 'r') as f:
        response = f.read()
    
    return analyzer.polarity_scores(response)
