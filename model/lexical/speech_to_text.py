import speech_recognition as sr

def transcribe(audio_path):
    recognizer = sr.Recognizer()
    with sr.AudioFile(audio_path) as source:
        recorded_audio = recognizer.listen(source)
        try:
            text = recognizer.recognize_google(
                    recorded_audio, 
                    language="en-US"
                )
            return text
        except Exception as ex:
            print(ex)
