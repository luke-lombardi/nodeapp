'''
    endpoint: /fyb/flushNodes
    method: POST
    format: application/json

    description:

'''

import redis
import json
import logging

from uuid import uuid4

from random import randint

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
    rds = redis.StrictRedis(host='redis-18280.c10.us-east-1-4.ec2.cloud.redislabs.com', password='OKyQXRnYwPSxy7ivgJ6l12DjoSNNIiJ0', port=18280, db=0, socket_connect_timeout=5)

    connected = is_cache_connected(rds)
    if connected:
        logging.info('Connection successful.')
        return rds
    else:
        logging.info('Could not connect to redis cache.')
        return None



def lambda_handler(event, context):
    rds = connect_to_cache()
    
    if not rds:
        return
    
    
    rds.flushall()
    
    return "done"


def run():
    test_event = {
    }
    
    test_context = {

    }

    response = lambda_handler(test_event, test_context)
    print(response)

    
    

if __name__ == '__main__':run()