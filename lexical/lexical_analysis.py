import vaderSentiment as vader
import speech_to_text as stt

analyzer = vader.SentimentIntensityAnalyzer()

def calc_score():
    response = stt.transcribe()
    return analyzer.polarity_scores(response)
