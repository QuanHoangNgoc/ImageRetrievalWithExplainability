import logging
import requests

from itertools import groupby
from helpers.first.milvus_server import MilvusClient

from utils.tools import pairwise
from utils.datetime_utils import time_this

from lsc.apps import LscConfig as cfg
from lsc.utils.dataset import DatasetManager

logger = logging.getLogger(__name__)

# def group_image_names_and_score_by_video(names: List[str], scores: List[float]):
#     # score is distance -> the smaller the better
#     names_sorted = sorted(list(zip(names, scores)), key=lambda x: (video_id(x[0]), x[1]))
#     names, _ = zip(*names_sorted)
#     grouped = [{
#             "shot_id": key,
#             "keyframe_list": list(group),
#         }
#         for key, group in groupby(names, video_id)
#     ]
#     return grouped

@time_this
def group_by_day(image_names, scores, client):
    all_features = client.get_image_feature(image_names)
    image_info = {
        name: {
            "score": score,
            "feature": feature
        }
        for name, score, feature in zip(image_names, scores, all_features)
    }

    # example name: 20190101_103717_000.jpg 

    def process_day(image_day_names):
        # reduce candidates in 1 day
        image_features = [image_info[name]["feature"] for name in image_day_names]
        day_shots = reduce_day(image_day_names, image_features, threshold_dist=0.2)
        image_day_names = [min(shot, key=lambda x: image_info[x]["score"]) for shot in day_shots]
        group_scores = [image_info[name]["score"] for name in image_day_names]
        return {
            "group_score": min(group_scores),
            "all_scores": group_scores,
            "images": image_day_names,
        }

    groups = []
    for key, group in groupby(sorted(image_names), key=lambda x: x[:8]):
        groups.append(process_day(list(group)))

    groups.sort(key=lambda x: x["group_score"])

    ranklist = []
    rankscores = []
    for group in groups:
        ranklist.extend(group["images"])
        rankscores.extend(group["all_scores"])
    return {"shots": ranklist, "scores": rankscores}

def reduce_day(image_names, image_features, threshold_dist=0.08, threshold_shot=20):
    shots = []
    current_shot = [image_names[0]]

    for (_, current_feat), (next_image, next_feat) in pairwise(zip(image_names, image_features)):
        sim = current_feat @ next_feat.T
        dist = 1 - sim
        if dist < threshold_dist:
            current_shot.append(next_image)
        else:
            shots.append(current_shot)
            current_shot = [next_image]

    shots.append(current_shot)
    return shots

def process_ranklist(ranklist, client: MilvusClient):
    return group_by_day(ranklist["shots"], ranklist["scores"], client)
    # return ranklist

def do_visualization(ranklist, text, dataset_manager: DatasetManager):
    logger.info(f"Visualizing for expression {text}")
    viz_shots = []
    for shot in ranklist["shots"][:50]:
        viz_shots.append(requests.get(cfg.refer_url, params={
            "image_path": dataset_manager.get_image_path(shot), 
            "expression": text}).content.decode('utf-8'))
    return {"shots": viz_shots, "scores": ranklist["scores"][:50]}

def parse_text(text):
    params = dict()

    text = text.strip()
    texts = text.split(">")
    if len(texts) > 1:
        if len(texts) > 2:
            logger.warning("More than 2 temporal queries!")
        text_1, text_2 = texts[0].strip(), texts[1].strip()
        if text_1 is None:
            params["text"] = text_2
        else:
            params["text"] = text_1 
            if text_2 is not None:
                params["text_2"] = text_2
        return params 
        
    # Relevance feedback
    num_relevance_feedback = text.find('*')
    if num_relevance_feedback != -1:
        num_relevance_feedback = 1
        text.replace('*', '')   
    else:
        num_relevance_feedback = 0

    # filter
    if text.find("|") != -1:
        params["filter"] = "hello"
        return params
    # texts = text.split("|")
    # if len(texts) > 1:
    #     if len(texts) > 2:
    #         logger.warning("More than 1 time clause!")
    #     text, filter_clause = texts[0].strip(), texts[1].strip()
    #     params["filter"] = filter_clause
    #     logger.info(f"Performing filtering {filter_clause}")
        
    # search by image url
    if text.startswith("http"):
        return {"image_url": text}

    params["relevance_feedback"] = num_relevance_feedback
    params["text"] = text
    return params

from itertools import groupby, product, chain 

def group_multiple_events(events):
    """
    Summary

    Args:   
        events (_type_): _description_
    """
    def group_by_day(event):
        group = dict() 
        image_names, scores = event["shots"], event["scores"]
        image_names = [name.split(".")[0] for name in image_names]
        name_to_score = {
            name: score for name, score in zip(image_names, scores)
        }
        #print(name_to_score)
        for key, value in groupby(sorted(image_names), key=lambda x: x[:8]):
                image_day_names = list(value) 
                group_scores = [name_to_score[name] for name in image_day_names]
                group[key] = {
                    "images": image_day_names,
                    "scores": group_scores
                }
        return group 
    groups = [group_by_day(event) for event in events]
    pair_groups = [] 
    for key in groups[1]:
        if key in groups[0]:
            list_1 = list(zip(groups[0][key]["images"], groups[0][key]["scores"]))
            list_2 = list(zip(groups[1][key]["images"], groups[0][key]["scores"]))
            combinations = list(product(list_1, list_2))
            combinations = [(x1, x2) for (x1, x2) in combinations if x1 <= x2]
            if len(combinations) == 0:
                continue 
            combinations.sort(key = lambda x: x[0][1] + x[1][1])

            pair_groups.append({
                "group_score": combinations[0][0][1] + combinations[0][1][1],
                "scores": list(chain(*[(i[1], j[1]) for i, j in combinations])),
                "images": list(chain(*[(i[0], j[0]) for i, j in combinations]))
            })

    pair_groups.sort(key=lambda x: x["group_score"])
    ranklist = [] 
    rankscores = [] 
    for pair_group in pair_groups:
        ranklist.extend(pair_group["images"])
        rankscores.extend(pair_group["scores"])
    return {"shots": [name + ".webp" for name in ranklist], "scores": rankscores}