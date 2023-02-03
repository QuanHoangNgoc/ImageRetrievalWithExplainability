import logging
from lsc.models import SessionData

from api.constants import Result
from utils.response_utils import (
        api_response, 
        api_response_error_params,
        api_response_error_method,
)

logger = logging.getLogger(__name__)

def create_session():
    sess = SessionData()
    sess.save()
    return api_response(Result.SUCCESS, sess.id)

DATASET_LIST = ["TESTING"]
def update_session(sess_id, dataset_name):
    if dataset_name in DATASET_LIST:
        sess = SessionData.objects.get(pk=sess_id)
        sess.dataset_name = dataset_name
        sess.save()
    return api_response(Result.SUCCESS)

def delete_session(sess_id):
    try:
        SessionData.objects.get(pk=sess_id).delete()
    except:
        logger.warning("Session ID to be deleted not found!")
        return api_response_error_params()
    return api_response(Result.SUCCESS)
