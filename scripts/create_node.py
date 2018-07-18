'''
    endpoint: /fyb/createNode
    method: POST
    format: application/json

    description:
        Adds a new node to the database and returns a unique 5-digit PIN.
        This pin can then be added to the 'tracked' node list.
'''

import redis
import json
import logging

from random import randint

logger = logging.getLogger()
logger.setLevel(logging.INFO)


DEFAULT_NODE_TTL = 3600


def random_pin(n):
    range_start = 10**(n-1)
    range_end = (10**n)-1
    return randint(range_start, range_end)


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
        

def get_new_pin(rds):
    pin = random_pin(5)
    while rds.exists(pin):
        pin = random_pin(5)
    return pin


def insert_node(rds, pin, node_data):
    rds.setex(name=pin, value=json.dumps(node_data), time=DEFAULT_NODE_TTL)

def lambda_handler(event, context):
    rds = connect_to_cache()
    
    if not rds:
        return
    
    node_data = event.get('node_data', {})
    if node_data:
        pin = get_new_pin(rds)
        logging.info('Generated new pin: %d', pin)
        insert_node(rds, pin, node_data)

    logging.info(json.loads(rds.get('12345')))


def run():
    test_event = {
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