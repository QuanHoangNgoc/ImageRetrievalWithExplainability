import json
import logging

from django.views.decorators.csrf import csrf_exempt, requires_csrf_token
from django.views.decorators.http import require_http_methods
from django.http import JsonResponse

from api.managers import search_manager
from api.constants import Result

from utils.response_utils import (
        api_response, 
        api_response_error_params,
        api_response_error_method,
)


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
            if crop is not None: crop = json.loads(crop)
            topk = int(request.GET.get("topk", "2048"))
        except:
            return api_response_error_params()

        try:
            if image_name is not None or image_url is not None:
                ret = search_manager.do_visual_search(image_url=image_url, image_name=image_name, crop=crop, topk=topk)
            else:
                ret = search_manager.do_search(text=text_query, topk=topk)
            print(ret)
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
        except:
            return api_response_error_params()
        try:
            if image_encoded is not None:
                ret = search_manager.do_visual_search(image_encoded=image_encoded, topk=topk)
            else:
                ret = search_manager.do_search(text=text_query)
        except Exception as e:
            logger.exception(e)
            return api_response(Result.ERROR_SEARCH_ENGINE_FAILED)
        return api_response(Result.SUCCESS, ret)
    
    return api_response_error_method()

@csrf_exempt
@require_http_methods(['GET'])
def video(request):
    try:
        print(request)
        text_query = request.GET["shot_name"]
    except Exception as e:
        logger.exception(e)
        return api_response_error_params()

    try:
        ret = search_manager.get_video_shots(text_query)
        return api_response(Result.SUCCESS, ret)
    except Exception as e:
        logger.exception(e)
        return api_response(Result.ERROR_SEARCH_ENGINE_FAILED)
