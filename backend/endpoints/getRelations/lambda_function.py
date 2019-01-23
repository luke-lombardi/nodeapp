'''
    endpoint: /fyb/getNodes
    method: GET
    format: application/json

    description:
        Grabs a list of nodes metadata by their unique node_id numbers.
'''

import redis
import json
import logging
import os

from modules import cache

logger = logging.getLogger()
logger.setLevel(logging.INFO)

local_env = os.environ.get('LOCAL_ENV', 0)

if local_env:
  from config_LOCAL import Config as ConfigDev
else:
  from config_DEV import Config as ConfigDev
  from config_PROD import Config as ConfigProd

def get_relations(rds, user_id, relations_to_get):
    relations = {}

    for relation_id in relations_to_get:
        relation_exists = rds.exists(relation_id)

        if relation_exists:
            relation_data = rds.get(relation_id)

            if not relation_data:
                logger.info('Found no data for relation %s' % (relation_id) )
                relations[relation_id] = {}
            else:
                relation_data = json.loads(relation_data)

                # Check if you are sharing your location in this relation
                user_friend_id = relations['member_data'][user_id]['friend_id']
                current_status = None

                if rds.exists(user_friend_id):
                    current_status = rds.get(user_friend_id).decode('utf-8')
                    if current_status == 'hidden':
                        relations[relation_id]['sharing_location'] = False
                    else:
                        relations[relation_id]['sharing_location'] = True

                relations[relation_id] = relation_data
  
        else:
            relations[relation_id] = {"status": "not_found"}
            logger.info('Relation %s not found' % (relation_id, ))

    return relations


def lambda_handler(event, context):
    # If we are running locally, use the DEV config file
    if not context:
        rds = cache.connect_to_cache('DEV')
    else:
        # Choose which config file to use based on the invoked function ARN
        context_vars = vars(context)
        alias = context_vars['invoked_function_arn'].split(':')[-1]

        if alias == 'PROD':
            rds = cache.connect_to_cache('PROD')
        else:
            rds = cache.connect_to_cache('DEV')

    if not rds:
        return
    
    user_id = event.get('user_id', None)

    relations = []

    if user_id is not None and relations_to_get:
        relations_to_get = event.get('relations', [])
        relations = get_relations(rds, user_id, relations_to_get)
        logger.info("Returning relations: {}".format(relations))
    else:
        logger.info("Not getting relations for user: {}, {}".format(user_id, relations_to_get))
  
    return relations


def run():
    test_event = {
    }
    
    test_context = {

    }

    response = lambda_handler(test_event, test_context)
    print(response)

    
    

if __name__ == '__main__':run()