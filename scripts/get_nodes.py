'''
    endpoint: /fyb/getNodes
    method: GET
    format: application/json

    description:
        Grabs a list of nodes metadata by their unique node_id numbers.
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

def get_mirrored_node_id(rds, temp_id):
    node_exists = rds.exists(temp_id)
    if node_exists:
        return rds.get(temp_id).decode("utf-8") 
    else:
        return None

def get_nodes(rds, node_ids_to_get):
    nodes = {}

    for node_id in node_ids_to_get:

        node_type = 'standard'

        node_exists = rds.exists(node_id)
        if node_exists:
            if 'group_member' in node_id:
                node_type = 'group_member'
                logging.info('Node %s exists but is mirrored, getting data', node_id)
                node_id = get_mirrored_node_id(rds, node_id)
                logging.info('Found mirror node: %s, getting data', node_id)
            elif 'friend' in node_id:
                node_type = 'friend'
                logging.info('Node %s exists but is mirrored, getting data', node_id)
                node_id = get_mirrored_node_id(rds, node_id)
                logging.info('Found mirror node: %s, getting data', node_id)
            
            logging.info('Node %s exists, getting data', node_id)
            node_data = json.loads(rds.get(node_id))
            current_ttl = rds.ttl(node_id)
            nodes[node_id] = node_data
            nodes[node_id]['ttl'] = current_ttl
            nodes[node_id]['status'] = "active"

            if node_type == 'group_member':
                nodes[node_id]['color'] = 'black'
            else:
                nodes[node_id]['color'] = 'blue'
        else:
            nodes[node_id] = {"status": "not_found"}
            logging.info('Node %s not found' % (node_id, ))

    return nodes


def lambda_handler(event, context):
    rds = connect_to_cache()
    
    if not rds:
        return
    
    node_ids_to_get = event.get('node_ids', 0)
    nodes = get_nodes(rds, node_ids_to_get)

    return nodes


def run():
    test_event = {
        "node_ids": ["private:4b4808fc-dec7-41de-bd7f-1327cab4e139","group_member:f99fb76e-7067-4747-8e9c-12698db32be4"]
    }
    
    test_context = {

    }

    response = lambda_handler(test_event, test_context)
    print(response)

    
    

if __name__ == '__main__':run()