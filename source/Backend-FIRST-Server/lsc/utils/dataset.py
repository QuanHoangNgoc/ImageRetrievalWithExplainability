import logging
from pathlib import Path

from PIL import Image

from helpers.first.milvus_server import MilvusClient

from lsc.apps import LscConfig as cfg
from lsc.models import SessionData 

logger = logging.getLogger(__name__)

with open("lsc/path_correction.txt") as f:
    records = [line.strip().split(' ') for line in f.readlines()]

name_corrections = {
    record[0] : record[1] for record in records
}

class DatasetManager:
    managers = {}

    @classmethod
    def get(cls, state_id):
        logger.info(f"Fetching dataset manager for state_id {state_id}")
        try:
            if not state_id in cls.managers:
                cls.managers[state_id] = DatasetManager(SessionData.objects.get(pk=state_id).dataset_name)
            return cls.managers[state_id]
        except Exception as e:
            logger.exception(e)
            logger.critical(f"Dataset manager for state_id {state_id} not found!")
        return None

    def __init__(self, dataset_name, client=None):
        logger.info(f"Creating dataset manager of dataset {dataset_name}")
        self.dataset_name = dataset_name
        if client is not None:
            self.client = client
        else:
            self.client = MilvusClient(
                collection_name=dataset_name,
                host=cfg.milvus_host,
                port=cfg.milvus_port,
            )

    def load_image(self, image_name):
        if self.dataset_name == "LSC_full":
            # year_month = image_name[:6]
            # day = image_name[6:8]
            # image_path = f"/home/vbs1/lsc2022/data/resized_images_webp/{year_month}/{day}/{image_name}"
            return Image.open(self.get_image_path(image_name))
        logger.critical("Critical error!")
        return None

    def get_day_path(self, image_id, data_path):
        if self.dataset_name == "LSC_full":
            image_id = image_id.split('.')[0]
            if image_id.startswith("2000"):
                return data_path / Path(name_corrections[image_id]).relative_to("/home/vbs2/lsc/extracted").parent

            yearmonth = image_id[:6]
            day = image_id[6:8]
            
            day_path = Path(data_path) / yearmonth / day 
            return day_path
        logger.critical("Critical error!")
        return None

    def get_image_path(self, image_name):
        if self.dataset_name == "LSC_full":
            image_path = self.get_day_path(image_name, cfg.data_path) / image_name    
            if image_path.with_suffix(".jpg").exists():
                return image_path.with_suffix(".jpg")
            elif image_path.with_suffix(".webp").exists():
                return image_path.with_suffix(".webp")
            else:
                logger.critical(f"Error: image {image_name} not found!")
                return image_path
        logger.critical("Critical error!")
        return None

    # def get_image_feature(self, image_names):
    #     return self.client.get_image_features(image_names)

    # def search(self, feature_vector, search_param, topk=2048):
    #     return self.client.search(feature_vector, search_param, topk=2048)

    # def map_milvus_id_to_image_name(self, milvus_id):
    #     return self.client.map_milvus_id_to_image_name(milvus_id)

    