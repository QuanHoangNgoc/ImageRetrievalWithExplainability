import logging
import urllib.request

import numpy as np
from PIL import Image

from api.apps import ApiConfig as cfg

from utils.image_utils import convert_RGBA_to_RGB, crop_image, decode_b64_image

from helpers.first.clipmodel import encode_text, encode_image
from helpers.first.milvus_server import MilvusClient
from helpers.first.utils import group_image_names_and_score_by_video, load_image

logger = logging.getLogger(__name__)
client = MilvusClient(
    collection_name=cfg.collection_name, 
    host=cfg.host, 
    port=cfg.port,
    milvus_id_file_path="api/milvus_ids.txt",
    image_names_file_path=cfg.keyframe_list_path,
)

def do_visual_search(image_url=None, image_name=None, image_encoded=None, crop=None, *args, **kwargs):
    feature_vector = None

    if image_name is not None and crop is None:
        feature_vector = client.get_image_feature([image_name])
    else:
        if image_url is not None:
            urllib.request.urlretrieve(image_url, "api/tmp/tmp.jpg")
            img = Image.open("api/tmp/tmp.jpg")
            if img.mode == 'RBGA':
                img = convert_RGBA_to_RGB(img)
        elif image_name is not None:
            img = load_image(image_name)
        elif image_encoded is not None:
            img = decode_b64_image(image_encoded)

        if crop is not None:
            img = crop_image(img, crop)

        feature_vector = encode_image(img).numpy().astype(np.float32)

    return do_search(image_feature=feature_vector, *args, **kwargs)

def do_search(text=None, image_feature=None, topk=2048):
    feature_vector = None

    if text is not None:
        feature_vector = encode_text(text).numpy().astype(np.float32)
    elif image_feature is not None:
        feature_vector = image_feature

    if feature_vector is None:
        logger.warning("Warning! Engine error")
        return None

    results = client.search(feature_vector, {"nprobe": min(1024, topk)}, topk=topk)
    ids = [client.map_milvus_id_to_image_name(id) for id in results.id_array[0]]
    return {"shots": ids, "scores": results.distance_array[0]}
    # return {"ranked_list": group_image_names_and_score_by_video(ids, results.distance_array[0])}

def get_video_shots(shot_name):
    shots = []
    with open(cfg.keyframe_list_path) as f:
        shots = [line.strip() for line in f.readlines()]

    print(shot_name)

    def video_id(name): return name[4:9]
    target_video_id = video_id(shot_name)
 
    shot_in_video = [
        shot for shot in shots if video_id(shot) == target_video_id
    ]

    return shot_in_video

