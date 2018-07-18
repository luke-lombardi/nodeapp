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


DEFAULT_NODE_TTL = 3600


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


def update_node(rds, pin, node_data):
    current_ttl = rds.ttl(pin)
    logging.info('Node %d has %d seconds to live.', pin, current_ttl)
    if current_ttl < 0:
        current_ttl = DEFAULT_NODE_TTL

    rds.setex(name=pin, value=json.dumps(node_data), time=current_ttl)


def lambda_handler(event, context):
    rds = connect_to_cache()
    
    if not rds:
        return
    
    pin = event.get('pin', 0)
    node_data = event.get('node_data', {})
    if node_data:
        update_node(rds, pin, node_data)

    logging.info(json.loads(rds.get(pin)))

    return json.dumps(json.loads(rds.get(pin)))


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

    response = lambda_handler(test_event, test_context)
    print(response)

    
    

if __name__ == '__main__':run()