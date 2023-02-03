import json
import logging
import requests
from pathlib import Path

import numpy as np
from PIL import Image

from lsc.apps import LscConfig as cfg
from lsc.utils.retrieval import process_ranklist, reduce_day, parse_text, group_multiple_events, do_visualization
from lsc.utils.dataset import DatasetManager

from utils.image_utils import convert_RGBA_to_RGB, crop_image, decode_b64_image

from helpers.first.clipmodel import encode_text, encode_image
from helpers.first.milvus_server import MilvusClient
from helpers.first.utils import retrieve_image

from helpers.first.relevance_feedback import pseudo_relevance_feedback

logger = logging.getLogger(__name__)
client = MilvusClient(
    collection_name=cfg.collection_name, 
    host=cfg.milvus_host, 
    port=cfg.milvus_port,
    milvus_id_file_path=cfg.milvus_id_path,
    image_names_file_path=cfg.image_list_path,
)

def do_visual_search(image_url=None, image_name=None, image_encoded=None, crop=None, state_id=None, *args, **kwargs):
    dataset_manager = DatasetManager.get(state_id)
    if image_name is not None and crop is None:
        feature_vector = client.get_image_feature([image_name])
    else:
        if image_url is not None:
            img = retrieve_image(image_url)
            if img.mode == 'RBGA':
                img = convert_RGBA_to_RGB(img)
        elif image_name is not None:
            img = dataset_manager.load_image(image_name)
        elif image_encoded is not None:
            img = decode_b64_image(image_encoded)

        if crop is not None:
            img = crop_image(img, crop)

        feature_vector = encode_image(img).numpy().astype(np.float32)

    return do_search(image_feature=feature_vector, state_id=state_id, *args, **kwargs)

def do_search(text=None, image_feature=None, topk=2048, filter="", state_id=None):
    logger.info(f"Searching with state_id = {state_id}")
    dataset_manager = DatasetManager.get(state_id)
    relevance_feedback = 0
    params = {}

    if text is not None:
        params = parse_text(text)
        if "text" not in params and "filter" in params:
            return do_filter(None, filter)

        # temporal search
        if "text_2" in params:
            logger.info("Temporal searching")
            event_0 = do_search(text=params["text"], topk=topk, filter=filter)
            event_1 = do_search(text=params["text_2"], topk=topk, filter=filter)
            return group_multiple_events([event_0, event_1])

        text = params.get("text", None)
        image_url = params.get("image_url", None)
        relevance_feedback = params.get("relevance_feedback", 0)

        if image_url is not None:
            logger.info("Searching by image url")
            return do_visual_search(image_url=image_url, topk=topk, filter=filter)
        elif text is not None and text != "":
            feature_vector = encode_text(text).numpy().astype(np.float32)
        else:
            feature_vector = None
    elif image_feature is not None:
        feature_vector = image_feature
    else:
        feature_vector = None

    if feature_vector is None:
        logger.warning("Engine error")
        return None

    results = client.search(feature_vector, {"nprobe": min(1024, topk)}, topk=topk)
    ids = [name + ".webp" for name in client.map_milvus_ids_to_image_names(results.id_array[0])]

    if relevance_feedback > 0:
        logger.info("Performing pseudo relevance feedback")
        new_feature_vector = pseudo_relevance_feedback(
            query=feature_vector,
            search_results=ids,
            client=client,
            num_update=relevance_feedback
        )
        results = client.search(new_feature_vector, {"nprobe": min(1024, topk)}, topk=topk)
        ids = [name + ".webp" for name in client.map_milvus_ids_to_image_names(results.id_array[0])]
    
    ranklist = process_ranklist({"shots": ids, "scores": results.distance_array[0]}, client)   
    
    # if text is not None:    # do visualizations
        # WARNING: DOES NOT WORK FOR LOCAL LOAD VERSION!
        # ranklist = do_visualization(ranklist, text, dataset_manager)
    
    # filter
    if filter != "":
        ranklist = do_filter(ranklist, filter)
    return ranklist
    # return {"ranked_list": group_image_names_and_score_by_video(ids, results.distance_array[0])}

def get_video_shots(shot_name, level_detail=None, state_id=None):
    logger.info(f"Getting video shots with state_id = {state_id}")
    dataset_manager = DatasetManager.get(state_id)
    day_path = dataset_manager.get_day_path(shot_name, cfg.data_path)
    print(day_path)
    file_names = [
        path.with_suffix(".webp").name for path in day_path.iterdir() if path.suffix == ".jpg"
    ]
    file_names = list(sorted(file_names))

    if level_detail is not None:
        image_features = client.get_image_feature([
            name.split('.')[0] for name in file_names
        ])
        level_detail = float(level_detail)
        shots = reduce_day(file_names, image_features, threshold_dist=level_detail)
        return [shot[0] for shot in shots]

    return file_names

def do_filter(ranklist, filter_clause):
    if filter_clause == "":
        return ranklist

    def extract_response(response):
        response_content = json.loads(response.content)
        if response_content["result"] != "success":
            logger.critical("Filter failed!")

        lists = response_content["reply"]["ranked_list"]
        image_list = []
        for cluster in lists:
            image_list.extend(cluster["image_list"])
        return image_list
    
    if ranklist is None:
        resp = requests.post(cfg.filter_url, json={
            "user_id": "hxnhat",
            "state_id": "",
            "query": filter_clause,
        })
        image_list = extract_response(resp)
        return {"shots": [name + ".webp" for name in image_list], "scores": [1] * len(image_list)}

    name_to_score = {
        name: score for name, score in zip(ranklist["shots"], ranklist["scores"])
    }

    ranklist["shots"] = [name.split('.')[0] for name in ranklist["shots"]]
    resp = requests.post(cfg.filter_url, json={
        "user_id": "hxnhat",
        "state_id": "",
        "query": filter_clause,
        "prev_image_list": ranklist["shots"]
    })
    name_to_score = {
        name: score for name, score in zip(ranklist["shots"], ranklist["scores"])
    }
    
    image_list = extract_response(resp)
    logger.info(f"Length of filtered results: {len(image_list)}")
    image_list = [name for name in image_list if name in name_to_score]
    image_list.sort(key=lambda x: name_to_score[x])
    logger.info(f"Length of filtered results final: {len(image_list)}")
    return {"shots": [name + ".webp" for name in image_list], "scores": [name_to_score[name] for name in image_list]}

# if filters is not None:
#     filter_set = set(filters)
#     rerank_list = [
#         (image_id, score) for image_id, score in zip(ranklist["shots"], ranklist["scores"]) if image_id.split('.')[0] in filter_set
#     ]
#     ranklist["shots"], ranklist["scores"] = zip(*rerank_list)
    