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


def get_relation(rds, user_id, relation_id):
    relation = {}

    relation_exists = rds.exists(relation_id)

    if relation_exists:
        relation_data = rds.get(relation_id)

        if not relation_data:
            logger.info('Found no data for relation %s' % (relation_id) )
            relation = {}
        else:
            relation_data = json.loads(relation_data)
            relation = relation_data

            # Check if you are sharing your location in this relation
            user_friend_id = relation['member_data'][user_id]['friend_id']
            current_status = None

            if rds.exists(user_friend_id):
                logger.info('User friend ID exists: %s' % (user_friend_id))
                current_status = rds.get(user_friend_id).decode('utf-8')
                logger.info('Current status: %s' % (current_status))
                if current_status == 'hidden':
                    relation['sharing_location'] = False
                else:
                    relation['sharing_location'] = True

    else:
        relation = relation_data
        logger.info('Relation %s not found' % (relation_id, ))

    return relation


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

    relation_id = event.get('relations', [])
    relation = {}
    if user_id is not None and relation_id is not None:
        
        relation_id = get_relation(rds, user_id, relation_id)
        logger.info("Returning relation: {}".format(relation))
    else:
        logger.info("Not getting relations for user: {}, {}".format(user_id, relation_id))
  
    return relation


def run():
    test_event = {
    }
    
    test_context = {

    }

    response = lambda_handler(test_event, test_context)
    print(response)

    
    

if __name__ == '__main__':run()