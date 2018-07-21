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
    rds = redis.StrictRedis(host='redis-11771.c10.us-east-1-4.ec2.cloud.redislabs.com', password='3VyLUrhKv8BzUWtZKtKoIFdqlMk6TVOQ', port=11771, db=0, socket_connect_timeout=5)

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
            logging.info('Node %s exists, getting data', pin)
            node_data = json.loads(rds.get(pin))
            current_ttl = rds.ttl(pin)
            nodes[pin] = node_data
            nodes[pin]['ttl'] = current_ttl

        else:
            logging.info('Node %s not found')

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
        "pins": ["965133fc-bb3a-4f8d-a65e-4b98885c3c1f"]
    }
    
    test_context = {

    }

    response = lambda_handler(test_event, test_context)
    print(response)

    
    

if __name__ == '__main__':run()