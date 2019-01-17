'''
    endpoint: /postNode
    method: GET
    format: application/json

    description:
        
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


DEFAULT_NODE_TTL = 3600

def update_node(rds, node_id, node_data):
    current_ttl = rds.ttl(node_id)
    
    prefix = "private:"
    public = node_data.get("public", False)
    if public:
        prefix = "public:"

    key_name = prefix + node_id
    node_type = node_data.get('type', 'place')

    if node_type == 'person':
      rds.set(name=key_name, value=json.dumps(node_data))
    else:
      logging.info('Node %s has %d seconds to live.', node_id, current_ttl)
      rds.setex(name=key_name, value=json.dumps(node_data), time=DEFAULT_NODE_TTL)

    return key_name


def lambda_handler(event, context):
    # if we are running locally, use the DEV config file
    if not context:
        rds = cache.connect_to_cache('DEV')
    else:
        # choose which config file to use based on the invoked function ARN
        context_vars = vars(context)
        alias = context_vars['invoked_function_arn'].split(':')[-1]

        if alias == 'PROD':
            rds = cache.connect_to_cache('PROD')
        else:
            rds = cache.connect_to_cache('DEV')

    if not rds:
        return

    logging.info('Event payload: %s', event)

    
    node_id = event.get('node_id', 0)
    node_data = event.get('node_data', {})

    node_type = node_data.get('type', 'place')

    # If its a persons location node, then we have to grab the data from location obj
    if node_type == 'person':
        logging.info('Node type is person, grabbing location data')
        location = event.get('location', {})
        if location:
            node_data['lat'] = location['coords']['latitude']
            node_data['lng'] = location['coords']['longitude']

    key_name = None
    
    if node_data:
        key_name = update_node(rds, node_id, node_data)

    return key_name


def run():
    test_event = {
        "node_id": '12345',
        "node_data": {
            "title": "demos for sale",
            "lat": 43.13232,
            "lng": 43.333,
            "public": False,
            "type": "static",
        }
    }
    
    test_context = {

    }

    response = lambda_handler(test_event, test_context)
    print(response)

    
    

if __name__ == '__main__':run()