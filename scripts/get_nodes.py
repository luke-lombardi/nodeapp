'''
    endpoint: /fyb/getNodes
    method: GET
    format: application/json

    description:
        Grabs a list of nodes metadata by their unique pin numbers.
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


def get_nodes(rds, pins_to_get):
    nodes = {}

    for pin in pins_to_get:
        node_exists = rds.exists(pin)
        if node_exists:
            logging.info('Node %d exists, getting data', pin)
            node_data = json.loads(rds.get(pin))
            nodes[pin] = node_data
        else:
            logging.info('Node %d not found')

    return nodes


def lambda_handler(event, context):
    rds = connect_to_cache()
    
    if not rds:
        return
    
    pins_to_get = event.get('pins', 0)
    nodes = get_nodes(rds, pins_to_get)

    return nodes


def run():
    test_event = {
        "pins": [65496, 12345]
    }
    
    test_context = {

    }

    response = lambda_handler(test_event, test_context)
    print(response)

    
    

if __name__ == '__main__':run()