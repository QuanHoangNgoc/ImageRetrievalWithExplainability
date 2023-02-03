import LSC2020_API.LSC2020Algorithms.DCU_HCMUS.BOW.text_process as tp
from LSC2020_API.LSC2020Algorithms.DCU_HCMUS.Utils.datetime_utils import time_this

class QueryAnalyser:
    def __init__(self, query_generator):
        self.generator = query_generator

        self.es_tag2fields = {
            "LOCATION": {
                "location_name": 1,
                "locaton_address": 1,
                "place_category": 1,
                "place_attribute": 1
            },
            "CONCEPT": {
                "place_attribute": 1,
                "place_category": 1,
                "visual_concept": 2,
                "visual_genome": 2,
                "scene_text": 1,
            },
            "TIME": {
                "week_day": 10,
                "part_of_day": 10 
            }
        }

        # --------------------NEW FOR 2021 ---------------------------
        self.default_fields = {
            "CONCEPT": [
                "place_category^1",
                "microsoft_tag^1",
                "yolo_concept^2",
                "visual_genome^2",
            ],
            "LOCATION": [
                "country^8",
                "city^8",
                "location_name^4",
                "location_type^6",
                "place_category^2",
                "location_address^2"
            ],
            "TIME": [
                "day_of_week",
                "month",
                "year",
                "part_of_day",
                "local_time",
                "date"
            ]

        }

    # Query will need to be in the form:
    # "[visual concepts] ; [locations] ; [time]"
    def default_match(self, text_query):
        def parse_time(time_text):
            res = tp.parse(time_text)
            res += tp.time_parse(time_text, res)
            res = tp.analyse(res, tp.time_dictionary, tp.time_tags, exact=True)
            return res

        query_parts = text_query.split(';')
        query_parts = [i.strip() for i in query_parts]

        for idx, part in enumerate(query_parts):
            part.strip()
            if idx==0 and part!='':
                self.generator.gen_query_string_query(self.default_fields["CONCEPT"], part, True) 
            elif idx==1 and part!='':
                if '/' in part:
                    must_part, should_part = part.split('/')
                    if must_part.strip() != '':
                        self.generator.gen_query_string_query(self.default_fields["LOCATION"], must_part, False)
                    if should_part.strip() != '':
                        self.generator.gen_query_string_query(self.default_fields["LOCATION"], should_part, True) 
                else:
                    self.generator.gen_query_string_query(self.default_fields["LOCATION"], part, False)
            else:
                if part=='': continue
                token = parse_time(part)
                print(token)
                for t in token:
                    print(t)
                    value_format = None
                    if '-->' in t[1]:
                        value_type, value_format = t[1].split(' --> ')
                    else:
                        value_type = t[1]

                    if '-->' in t[0]:
                        value_from, value_to = t[0].split('-->')
                        self.generator.gen_range_query(value_type, value_from, value_to, value_format) 
                    else:
                        self.generator.gen_term_query(value_type, t[0])
                        



    def match_all(self, text_query):
        if len(text_query) == 0:
            self.generator.gen_match_all_query()
        else:
            fields_weight = {
                "week_day": 10,
                "part_of_day": 8,
                "visual_concept": 3,
                "visual_genome": 3,
                "place_attribute": 3,
                "place_category": 3,
                "location_name": 5,
                "location_address": 5
            }
            self.generator.gen_multi_matching_query(fields_weight, text_query, auto_fill=True)

    def nlp_match(self, text_query):
        query = {
            "TIME": [],
            "LOCATION": [],
            "CONCEPT": [],
        }
        tokens = tp.analyse(tp.parse(text_query))
        # Analysed text is in the form: ([token], [tag], [count])
        # Ex: ('car', CONCEPT, 1)
        for item in tokens:
            qtext, qtag = item[0:2]
            query[qtag].append(qtext)

        for key, value in query.items():
            if len(value) > 0:
                self.generator.gen_multi_matching_query(self.es_tag2fields[key], ' '.join(value))

    @time_this
    def analyse(self, text_query, mode="default"):
        if mode == "default":
            self.default_match(text_query)
        elif mode == "basic":
            self.match_all(text_query)
        else:
            self.nlp_match(text_query)
    
