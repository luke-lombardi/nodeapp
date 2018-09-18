'''
    endpoint: /fyb/postNode
    method: POST
    format: application/json

    description:
        Updates a nodes metadata. Used for moving nodes, such as people.
        This node_id can then be added to the 'tracked' node list.
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


def update_node(rds, node_id, node_data):
    current_ttl = rds.ttl(node_id)
    logging.info('Node %s has %d seconds to live.', node_id, current_ttl)
    
    prefix = "private:"
    public = node_data.get("public", False)
    if public:
        prefix = "public:"

    key_name = prefix + node_id

    rds.setex(name=key_name, value=json.dumps(node_data), time=DEFAULT_NODE_TTL)

    return key_name


def lambda_handler(event, context):
    rds = connect_to_cache()
    
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
        "node_id": 12345,
        "node_data": {
            "title": "demos for sale",
            "description": "its me mario",
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