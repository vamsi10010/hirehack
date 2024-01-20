import speech_recognition as sr

recognizer = sr.Recognizer()
path = "P1_1.wav"

with sr.AudioFile(path) as source:
    print("Recording:")
    recorded_audio = recognizer.listen(source)
    print("Done recording")
    try:
        text = recognizer.recognize_google(
                recorded_audio, 
                language="en-US"
            )

        print("Decoded Text : {}".format(text))

    except Exception as ex:
        print(ex)


sr.Microphone.list_microphone_names()