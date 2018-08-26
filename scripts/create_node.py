'''
    endpoint: /fyb/createNode
    method: POST
    format: application/json

    description:
        Adds a new node to the database and returns a unique 5-digit node_id.
        This node_id can then be added to the 'tracked' node list.
'''

import redis
import json
import logging

from uuid import uuid4

from random import randint

logger = logging.getLogger()
logger.setLevel(logging.INFO)


DEFAULT_NODE_TTL = 3600 * 24


def is_cache_connected(rds):
    try:
        response = rds.client_list()
    except redis.ConnectionError:
        return False
    return True


def connect_to_cache():
    rds = redis.StrictRedis(host='redis-11771.c10.us-east-1-4.ec2.cloud.redislabs.com', password='3VyLUrhKv8BzUWtZKtKoIFdqlMk6TVOQ', port=11771, db=0, socket_connect_timeout=5)

    connected = is_cache_connected(rds)
    if connected:
        logging.info('Connection successful.')
        return rds
    else:
        logging.info('Could not connect to redis cache.')
        return None


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

    rds.setex(name=key_name, value=json.dumps(node_data), time=ttl)

    return key_name

def lambda_handler(event, context):
    rds = connect_to_cache()
    
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
            "title": "demos for sale",
            "description": "its me mario",
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