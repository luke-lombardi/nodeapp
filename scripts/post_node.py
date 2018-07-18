'''
    endpoint: /fyb/postNode
    method: POST
    format: application/json

    description:
        Updates a nodes metadata. Used for moving nodes, such as people.
        This pin can then be added to the 'tracked' node list.
'''

import redis
import json
import logging


logger = logging.getLogger()
logger.setLevel(logging.INFO)


def is_cache_connected(rds):
    try:
        response = rds.client_list()
    except redis.ConnectionError:
        return False
    return True


def connect_to_cache():
    rds = redis.StrictRedis(host='localhost', port=6379, db=0, socket_connect_timeout=5)

    connected = is_cache_connected(rds)
    if connected:
        logging.info('Connection successful.')
        return rds
    else:
        logging.info('Could not connect to redis cache.')
        return None


def update_node(rds, pin, node_data):
    rds.set(pin, json.dumps(node_data))


def lambda_handler(event, context):
    rds = connect_to_cache()
    
    if not rds:
        return
    
    pin = event.get('pin', 0)
    node_data = event.get('node_data', {})
    if node_data:
        update_node(rds, pin, node_data)

    logging.info(json.loads(rds.get('12345')))


def run():
    test_event = {
        "pin": 12345,
        "node_data": {
            "title": "demos for sale",
            "description": "its me mario",
            "latitude": 43.13232,
            "longitude": 43.333,
            "latDelta": 0.00183,
            "longDelta": 0.00183,
            "type": "single"
        }
    }
    
    test_context = {

    }

    lambda_handler(test_event, test_context)


    
    

if __name__ == '__main__':run()