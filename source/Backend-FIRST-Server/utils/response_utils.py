from api.constants import Result 
from django.http import JsonResponse

def api_response(result_message, reply=None, status=200):
    response = JsonResponse({"result": result_message, "reply": reply}, status=status)
    response['content-type'] = 'application/json; charset=utf-8'
    return response

def api_response_error_params(*args):
    return api_response(Result.ERROR_PARAMS, status=400)

def api_response_error_method(*args):
    return api_response(Result.ERROR_METHOD, status=405)
