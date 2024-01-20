import vaderSentiment as vader
import speech_recognition as sr

analyzer = vader.SentimentIntensityAnalyzer()

def calc_score(paragraph):
    sentences_raw = paragraph.split("|")
    sentences = []
    return_vec = []
    for i in range(len(sentences_raw)):
        if sentences_raw[i].split(":")[0] == "Interviewee":
            sentences.append(sentences_raw[i].split(":")[1])
    for response in sentences:
        vs = analyzer.polarity_scores(response)
        return_vec.append(vs)
    return return_vec