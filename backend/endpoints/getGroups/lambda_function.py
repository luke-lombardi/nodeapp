'''
    endpoint: /fyb/getGroups
    method: GET
    format: application/json

    description:
        Grabs a list of groups metadata by their unique group_id strings
'''


import redis
import json
import logging
import os

from uuid import uuid4
from random import randint
from modules import cache

logger = logging.getLogger()
logger.setLevel(logging.INFO)

local_env = os.environ.get('LOCAL_ENV', 0)

if local_env:
  from config_LOCAL import Config as ConfigDev
else:
  from config_DEV import Config as ConfigDev
  from config_PROD import Config as ConfigProd


def get_groups(rds, group_ids_to_get):
    groups = {}

    for group_id in group_ids_to_get:
        group_exists = rds.exists(group_id)
        if group_exists:
            logging.info('group %s exists, getting data', group_id)
            group_data = json.loads(rds.get(group_id))
            current_ttl = rds.ttl(group_id)
            groups[group_id] = group_data
            groups[group_id]['ttl'] = current_ttl
            groups[group_id]['status'] = "active"
            groups[group_id]['members'] = [ k for k,v in groups[group_id]['members'].items() ]
        else:
            groups[group_id] = {"status": "not_found"}
            logging.info('group %s not found' % (group_id, ))

    return groups


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
    
    group_ids_to_get = event.get('group_ids', 0)
    groups = get_groups(rds, group_ids_to_get)

    return groups


def run():
    test_event = {
        "group_ids": ["group:202bdb74-ca74-4052-bcac-db9c7f57eb45"]
    }
    
    test_context = {

    }

    response = lambda_handler(test_event, test_context)
    print(response)

    
    

if __name__ == '__main__':run()