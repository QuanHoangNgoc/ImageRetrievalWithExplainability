import json
import pprint
from elasticsearch import Elasticsearch
from api.elasticsearch.query_generator import QueryGenerator
from api.elasticserach.query_analyser import QueryAnalyser
from utils.datetime_utils import time_this


class Processor:
    def __init__(self, host, port):
        self.host = host
        self.port = port
        self.generator = QueryGenerator()
        self.analyser = QueryAnalyser(self.generator)

    def connect(self):
        self.es = Elasticsearch([{'host':self.host, 'port':self.port}])
        if self.es.ping():
            print("Connected to Elasticsearch node")
            return True
        else:
            print("Error: Cannot connect to Elasticsearch cluster")
            return False


    def update_data_field(self, doc_id, field, value):
        body = {
            "script": "ctx._source.{0} = {1}".format(field, value)
        }
        result = self.es.update(index=ELASTIC_INDEX, id=doc_id, body=body)
        return result


    """
    Main function for searching in elasticsearch
    """
    @time_this
    def search(self, text_query, mode="default", incremental_query=False):
        if not incremental_query:
            self.generator.reset_query()
        self.analyser.analyse(text_query, mode)
        query = self.generator.run(profiler=True)
        #pprint.pprint(query) 
        result = self.es.search(index=ELASTIC_INDEX, body=json.dumps(query), size=1000)
        #print(result['profile']['shards'][0]['searches'][0]['query'][0]['description'])
        #logger.log(result['profile']['shards'][0]['searches'][0]['query'][0]['description'])
        return result

