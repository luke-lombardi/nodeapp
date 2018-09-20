'''
    endpoint: /fyb/getPublicNodes
    method: GET
    format: application/json

    description:
        Grabs a list of all public nodes present in the cache
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


def get_all_public_nodes(rds):
    nodes = []

    public_nodes = [key.decode("utf-8") for key in rds.keys(pattern='public[\:]*')]

    return  public_nodes


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
    
    nodes = get_all_public_nodes(rds)
    
    request_data = {
        "node_ids": nodes
    }

    return json.dumps(request_data)


def run():
    test_event = {
    }
    
    test_context = {

    }

    response = lambda_handler(test_event, test_context)
    print(response)

    
    

if __name__ == '__main__':run()