import json
import logging

from django.views.decorators.csrf import csrf_exempt, requires_csrf_token
from django.views.decorators.http import require_http_methods
from django.http import JsonResponse

from api.constants import Result
from utils.response_utils import (
        api_response, 
        api_response_error_params,
        api_response_error_method,
)

from .models import SessionData
from .managers import search_manager, session_manager

"""
IMPORTANT!!!

Only use this for getting inputs (from http request)
and return outputs (through JsonResponse).

Please make a call to external functions for further processing.
"""

logger = logging.getLogger('runtime')

@csrf_exempt
def search(request):
    if request.method == "GET":
        try:
            print(request.GET)
            text_query = request.GET.get('text', None)
            image_name = request.GET.get('shot_name', None)
            image_url = request.GET.get('image_url', None)
            crop = request.GET.get('crop', None)
            filter = request.GET.get('filter', "")
            if crop is not None: crop = json.loads(crop)
            topk = int(request.GET.get("topk", "2048"))
            state_id = request.GET["state_id"]
        except:
            return api_response_error_params()

        try:
            if image_name is not None or image_url is not None:
                ret = search_manager.do_visual_search(image_url=image_url, image_name=image_name, crop=crop, topk=topk, filter=filter, state_id=state_id)
            else:
                ret = search_manager.do_search(text=text_query, topk=topk, filter=filter, state_id=state_id)
            ret_len = len(ret["shots"])
            logger.info(f"Number of returned results: {ret_len}")
            return api_response(Result.SUCCESS, ret)
        except Exception as e:
            logger.exception(e)
            return api_response(Result.ERROR_SEARCH_ENGINE_FAILED)

    elif request.method == "POST":
        try:
            print(request.body)
            body = json.loads(request.body)
            text_query = body.get('text', None)
            image_encoded = body.get('image_encoded', None)
            topk = int(body.get("topk", "2048"))
            state_id = body["state_id"]
        except:
            return api_response_error_params()
        try:
            if image_encoded is not None:
                ret = search_manager.do_visual_search(image_encoded=image_encoded, topk=topk, state_id=state_id)
            else:
                ret = search_manager.do_search(text=text_query, state_id=state_id)
        except Exception as e:
            logger.exception(e)
            return api_response(Result.ERROR_SEARCH_ENGINE_FAILED)
        return api_response(Result.SUCCESS, ret)
    
    return api_response_error_method()

@csrf_exempt
@require_http_methods(['GET'])
def summary(request):
    try:
        print(request)
        shot_name = request.GET["shot_name"]
        level_detail = request.GET.get("detail", None)
        state_id = request.GET["state_id"]
    except Exception as e:
        logger.exception(e)
        return api_response_error_params()

    try:
        ret = search_manager.get_video_shots(shot_name, level_detail=level_detail, state_id=state_id)
        return api_response(Result.SUCCESS, ret)
    except Exception as e:
        logger.exception(e)
        return api_response(Result.ERROR_SEARCH_ENGINE_FAILED)

@csrf_exempt
def session(request, sess_id=None):
    if request.method == "GET":
        return session_manager.create_session()
    elif request.method == "POST":
        try:
            body = json.loads(request.body) 
            sessionID = body["sessionId"]
        except Exception as e:
            logger.exception(e)
            return api_response_error_params()
        return session_manager.update_session(sess_id=sess_id, dataset_name=sessionID)
    elif request.method == "DELETE":
        return session_manager.delete_session(sess_id=sess_id)
    return api_response_error_method()

@csrf_exempt
def submit(request):
    return api_response(Result.SUCCESS)