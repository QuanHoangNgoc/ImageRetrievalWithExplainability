class Result(object):
    SUCCESS = 'success'

    # Errors with request
    ERROR_PARAMS = 'error_params'
    ERROR_METHOD = 'error_method'
    ERROR_HEADER = 'error_header'
    ERROR_FORBIDDEN = 'error_forbidden'
    ERROR_UNAUTHORIZED = 'error_unauthorized'
    ERROR_CAPTCHA = 'error_captcha'
    ERROR_SERVER = 'error_server'

    # Errors with search engine
    ERROR_SEARCH_ENGINE_FAILED = 'error_search_engine_failed'


