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
        logger.info('Connection successful.')
        return rds
    else:
        logger.info('Could not connect to redis cache.')
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

        node_type = None

        node_exists = rds.exists(node_id)

        real_node_id = node_id

        if node_exists:
            if 'group_member' in node_id:
                node_type = 'group_member'
                logger.info('Node %s exists but is mirrored, getting data', node_id)
                real_node_id = get_mirrored_node_id(rds, node_id)
                logger.info('Found mirror node: %s, getting data', real_node_id)
            elif 'friend' in node_id:
                node_type = 'friend'
                logger.info('Node %s exists but is mirrored, getting data', node_id)
                real_node_id = get_mirrored_node_id(rds, node_id)
                logger.info('Found mirror node: %s, getting data', real_node_id)
            
            logger.info('Node %s exists, getting data', real_node_id)
            node_data = rds.get(real_node_id)

            if not node_data:
                logger.info('Found no node data for node %s' % (node_id) )
                nodes[node_id] = {}
                nodes[node_id]['status'] = 'inactive'
            else:
                node_data = json.loads(node_data)
                current_ttl = rds.ttl(node_id)
                nodes[node_id] = node_data
                nodes[node_id]['ttl'] = current_ttl
                nodes[node_id]['status'] = 'active'

            if node_type:
                nodes[node_id]['type'] = node_type

            if node_type == 'group_member':
                nodes[node_id]['color'] = 'black'
            else:
                nodes[node_id]['color'] = 'blue'
        else:
            nodes[node_id] = {"status": "not_found"}
            logger.info('Node %s not found' % (node_id, ))

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
        "node_ids": ["private:4b4808fc-dec7-41de-bd7f-1327cab4e139","friend:9a757f6e-1491-4368-b32d-7386c188a2cd"]
    }
    
    test_context = {

    }

    response = lambda_handler(test_event, test_context)
    print(response)

    
    

if __name__ == '__main__':run()