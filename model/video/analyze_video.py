from fer import FER
import cv2
from collections import Counter

def extract_frames(video_path, frames_per_second=0.5):
    # Extract frame from video with given frames per second and return array of images
    vidcap = cv2.VideoCapture(video_path)
    frame_rate = vidcap.get(cv2.CAP_PROP_FPS)
    frame_skip = int(frame_rate / frames_per_second)
    
    images = []
    count = 0
    while vidcap.isOpened():
        vidcap.set(cv2.CAP_PROP_POS_FRAMES, count)
        success, image = vidcap.read()
        if not success:
            break
        images.append(image)
        count += frame_skip
    vidcap.release()
    return images

def fer_video(video_path):
    # Map fer_image on extract_frames output
    images = extract_frames(video_path)
    mtcnn_detector = FER(mtcnn = True)
    
    emotion_sums = Counter({'angry': 0, 'disgust': 0, 'fear': 0, 'happy': 0, 'sad': 0, 'surprise': 0, 'neutral': 0})
    num_frames = 0
    
    for image in images:
        emotions = mtcnn_detector.detect_emotions(image)
        # print(emotions)
        try:
            for emotion, value in emotions[0]['emotions'].items():
                emotion_sums[emotion] += value
                num_frames += 1
        except:
            pass
            
    emotion_averages = {emotion: value / num_frames for emotion, value in emotion_sums.items()}
    
    return emotion_averages
        
def fer_image(image):
    mtcnn_detector = FER(mtcnn = True)

    # test_img = cv2.imread(image_path)
    return mtcnn_detector.detect_emotions(image)

