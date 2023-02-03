import logging

from django.apps import AppConfig

class ApiConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'api'

    # milvus config
    collection_name = "VBS_full"
    host = "localhost"
    port = "19530"
    keyframe_list_path = "api/keyframes_list.txt"

    def ready(self):
        logging.basicConfig(level=logging.INFO)
        from helpers.first import clipmodel