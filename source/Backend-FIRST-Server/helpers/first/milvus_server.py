import logging

import numpy as np
from milvus import Milvus, IndexType, MetricType, Status

from lsc.models import ImageEmbedding

from utils.tools import map_batch
from utils.datetime_utils import time_this

logger = logging.getLogger(__name__)

class MilvusClient:
    def __init__(self, 
            collection_name, 
            host='localhost', 
            port='19530', 
            milvus_id_file_path=None,
            image_names_file_path=None,
        ):
        self.client = Milvus(host=host, port=port)
        self.collection_name = collection_name
        status, ok = self.client.has_collection(collection_name)

        if not ok:
            logger.critical(f"Collection {collection_name} does not exists! Stopping.")
        else:
            logger.info("Milvus server successfully connected!")
            # self.init(milvus_id_file_path, image_names_file_path)

            self.id_to_name = {
                key : obj.image_name for key, obj in ImageEmbedding.objects.in_bulk(field_name='milvus_id').items()
            }

            self.name_to_id = {
                key : obj.milvus_id for key, obj in ImageEmbedding.objects.in_bulk(field_name='image_name').items()
            }

    def init(self, milvus_id_file_path, image_names_file_path):
        with open(milvus_id_file_path) as f:
            self.milvus_ids = [int(line.strip()) for line in f]
        with open(image_names_file_path) as f:
            self.image_names = [line.strip() for line in f]
        
        self.id_to_name = {
            milvus_id : self.image_names[idx] for idx, milvus_id in enumerate(self.milvus_ids)
        }
        
        self.name_to_id = {
            name : self.milvus_ids[idx] for idx, name in enumerate(self.image_names)
        }

    def search(self, feature_vector, search_param, topk=2048):
        if len(feature_vector.shape) != 2:
            logger.critical("Invalid shape for feature vector!")
            return None

        param = {
            'collection_name': self.collection_name,
            'query_records': feature_vector,
            'top_k': topk,
            'params': search_param,
        }

        status, results = self.client.search(**param)
        if status.OK():
            return results
        return None

    def map_milvus_id_to_image_name(self, milvus_id):
        return self.id_to_name[milvus_id]

    def map_milvus_ids_to_image_names(self, milvus_ids):
        return [self.map_milvus_id_to_image_name(id) for id in milvus_ids]

    def map_image_name_to_milvus_id(self, image_name):
        image_name = image_name.split('.')[0]
        return self.name_to_id[image_name]

    def map_image_names_to_milvus_ids(self, image_names):
        return [self.map_image_name_to_milvus_id(name) for name in image_names]

    @time_this
    def get_image_feature(self, image_names):
        @time_this
        def query_handler(ids):
            status, data = self.client.get_entity_by_id(self.collection_name, ids)
            if not status.OK():
                raise RuntimeError
            return data

        image_ids = self.map_image_names_to_milvus_ids(image_names)
        try:
            features = map_batch(image_ids, query_handler, 1000)
            if len(features) != len(image_ids): raise RuntimeError
        except:
            logger.critical(f"Fail to query image {image_names} from server")
            logger.critical(image_ids)
            return None
        return np.array(features, dtype=np.float32)
            


# client = Milvus(host='localhost', port='19530')
# collection_name = "VBS_full"
# status, ok = client.has_collection(collection_name)

# milvus_ids = None
# image_names = None
# id_to_name = None      
# name_to_id = None

# def init():
#     global all_ids, image_names, name_to_id, id_to_name

#     with open("helpers/first/milvus_ids.txt") as f:
#         milvus_ids = [int(line.strip()) for line in f]
#     with open("helpers/first/keyframes_list.txt") as f:
#         image_names = [line.strip() for line in f]
    
#     id_to_name = {
#         milvus_id : image_names[idx] for idx, milvus_id in enumerate(milvus_ids)
#     }
    
#     name_to_id = {
#         name : milvus_ids[idx] for idx, name in enumerate(image_names)
#     }

# def search(feature_vector, search_param, topk=2048):
#     if len(feature_vector.shape) != 2:
#         raise ValueError("Invalid shape for feature vector!")

#     param = {
#         'collection_name': collection_name,
#         'query_records': feature_vector,
#         'top_k': topk,
#         'params': search_param,
#     }

#     status, results = client.search(**param)
#     if status.OK():
#         return results
    
#     return None

# def map_milvus_id_to_image_name(milvus_id):
#     return id_to_name[milvus_id]

# def map_image_name_to_milvus_id(image_name):
#     return name_to_id[image_name]

# def get_image_feature(image_name):
#     image_id = map_image_name_to_milvus_id(image_name)
#     status, data = client.get_entity_by_id(collection_name, [image_id])
#     if status.OK() and len(data[0]) > 0:
#         return np.array([data[0]], dtype=np.float32)
#     else:
#         logger.critical(f"Fail to query image {image_name} from server")
#         return None

# if not ok:
#     logger.critical(f"Collection {collection_name} does not exists! Stopping.")
# else:
#     logger.info("Milvus server successfully connected!")
#     init()