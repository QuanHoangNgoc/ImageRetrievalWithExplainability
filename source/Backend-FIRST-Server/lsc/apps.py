import logging

from django.apps import AppConfig


class LscConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'lsc'

    # data_path = "/home/vbs2/lsc/extracted"
    data_path = "/home/vbs1/lsc2022/data/images"
    image_list_path = "lsc/image_list_full.txt"
    milvus_id_path = "lsc/milvus_ids_full.txt"

    # milvus config
    collection_name = "LSC_full"
    milvus_host = "localhost"
    milvus_port = "19530"

    filter_url = "http://localhost:20688/api/filter"
    refer_url = "http://localhost:20690/refer"

    def ready(self):
        logging.basicConfig(level=logging.INFO)
        from helpers.first import clipmodel