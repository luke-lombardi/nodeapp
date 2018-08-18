'''
    endpoint: /fyb/getinvites
    method: GET
    format: application/json

    description:
        Grabs a list of invites metadata by their unique invite_id strings
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


def get_invites(rds, invite_ids_to_get):
    invites = {}

    for invite_id in invite_ids_to_get:
        group_exists = rds.exists(invite_id)
        if group_exists:
            logging.info('invite %s exists, getting data', invite_id)
            invite_data = json.loads(rds.get(invite_id))
            current_ttl = rds.ttl(invite_id)
            invites[invite_id] = invite_data
        else:
            invites[invite_id] = {"status": "not_found"}
            logging.info('invite %s not found' % (invite_id, ))

    return invites


def lambda_handler(event, context):
    rds = connect_to_cache()
    
    if not rds:
        return
    
    invite_ids_to_get = event.get('invite_ids', 0)
    invites = get_invites(rds, invite_ids_to_get)

    return invites


def run():
    test_event = {
        "invite_ids": ["invite:35f7f2ba-c257-43a0-88c7-60ea0231776c"]
    }
    
    test_context = {

    }

    response = lambda_handler(test_event, test_context)
    print(response)

    
    

if __name__ == '__main__':run()