import speech_recognition as sr

def transcribe():
    recognizer = sr.Recognizer()
    path = "P1_1.wav"
    with sr.AudioFile(path) as source:
        recorded_audio = recognizer.listen(source)
        try:
            text = recognizer.recognize_google(
                    recorded_audio, 
                    language="en-US"
                )
            return text
        except Exception as ex:
            print(ex)
