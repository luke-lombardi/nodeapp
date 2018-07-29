'''
    endpoint: /fyb/getPublicNodes
    method: GET
    format: application/json

    description:
        Grabs a list of all public nodes present in the cache
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


def get_all_public_nodes(rds):
    nodes = []

    public_nodes = [key.decode("utf-8") for key in rds.keys(pattern='public[\:]*')]

    return  public_nodes


def lambda_handler(event, context):
    rds = connect_to_cache()
    
    if not rds:
        return
    
    nodes = get_all_public_nodes(rds)
    
    request_data = {
        "node_ids": nodes
    }

    return json.dumps(request_data)


def run():
    test_event = {
    }
    
    test_context = {

    }

    response = lambda_handler(test_event, test_context)
    print(response)

    
    

if __name__ == '__main__':run()