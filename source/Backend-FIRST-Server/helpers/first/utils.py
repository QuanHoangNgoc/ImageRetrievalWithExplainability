import urllib.request
from typing import List
from itertools import groupby

from PIL import Image

from configs.dev_env import KEYFRAME_ROOT

# for VBS
def video_id(name): 
    return name[4:9]

def group_image_names_and_score_by_video(names: List[str], scores: List[float]):
    # score is distance -> the smaller the better
    names_sorted = sorted(list(zip(names, scores)), key=lambda x: (video_id(x[0]), x[1]))
    names, _ = zip(*names_sorted)
    grouped = [{
            "shot_id": key,
            "keyframe_list": list(group),
        }
        for key, group in groupby(names, video_id)
    ]
    return grouped

def retrieve_image(image_url):
    urllib.request.urlretrieve(image_url, "api/tmp/tmp.jpg")
    img = Image.open("api/tmp/tmp.jpg")
    return img

def load_image(shot_name):
    vid = video_id(shot_name)
    frame_path = KEYFRAME_ROOT / vid / shot_name
    print(frame_path)
    return Image.open(frame_path)

