'''
    endpoint: /fyb/getGroups
    method: GET
    format: application/json

    description:
        Grabs a list of groups metadata by their unique group_id strings
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


def get_groups(rds, group_ids_to_get):
    groups = {}

    for group_id in group_ids_to_get:
        group_exists = rds.exists(group_id)
        if group_exists:
            logging.info('group %s exists, getting data', group_id)
            group_data = json.loads(rds.get(group_id))
            current_ttl = rds.ttl(group_id)
            groups[group_id] = group_data
            groups[group_id]['ttl'] = current_ttl
            groups[group_id]['status'] = "active"
            groups[group_id]['members'] = [ k for k,v in groups[group_id]['members'].items() ]
        else:
            groups[group_id] = {"status": "not_found"}
            logging.info('group %s not found' % (group_id, ))

    return groups


def lambda_handler(event, context):
    rds = connect_to_cache()
    
    if not rds:
        return
    
    group_ids_to_get = event.get('group_ids', 0)
    groups = get_groups(rds, group_ids_to_get)

    return groups


def run():
    test_event = {
        "group_ids": ["group:202bdb74-ca74-4052-bcac-db9c7f57eb45"]
    }
    
    test_context = {

    }

    response = lambda_handler(test_event, test_context)
    print(response)

    
    

if __name__ == '__main__':run()