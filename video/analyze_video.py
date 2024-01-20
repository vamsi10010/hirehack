from fer import FER
from fer import Video
import cv2
import pandas as pd

def fer_model(video_path):
    # Load the detector
    detector = FER(mtcnn=True)


    video = Video(video_path)

    result = video.analyze(detector, display=True)
    resultDF = video.to_pandas(result)


    return result


