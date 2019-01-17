'''
    endpoint: /fyb/createNode
    method: POST
    format: application/json

    description:
        Adds a new node to the database and returns a unique node_id.
        This node_id can then be added to the 'tracked' node list.
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


DEFAULT_NODE_TTL = 3600 * 24

def get_new_uuid(rds):
    node_id = uuid4()
    while rds.exists(node_id):
        node_id = uuid4()
    return node_id


def insert_node(rds, node_id, node_data):
    private = node_data.get("private", True)
    prefix = "private:"

    if not private:
        prefix = "public:"
    
    key_name = prefix+str(node_id)

    ttl = node_data.get("ttl", None)
    if ttl:
        ttl = ttl * 3600
    else:
        ttl = DEFAULT_NODE_TTL

    rds.setex(name=key_name, value=json.dumps(node_data), time=int(ttl))

    return key_name

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
    
    node_data = event.get('node_data', {})
    node_id = 0
    key_name = ""

    if node_data:
        node_id = get_new_uuid(rds)
        logging.info('Generated new node_id: %d', node_id)
        key_name = insert_node(rds, node_id, node_data)
    
    return key_name


def run():
    test_event = {
        "node_data": {
            "topic": "demos for sale",
            "lat": 43.13232,
            "lng": 43.333,
            "type": "static",
            "private": False,
            "ttl": 24,
        }
    }
    
    test_context = {

    }

    response = lambda_handler(test_event, test_context)
    print(response)

    
    

if __name__ == '__main__':run()