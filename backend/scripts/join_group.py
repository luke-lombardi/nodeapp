'''
    endpoint: /fyb/joinGroup
    method: POST
    format: application/json

    description:

'''

import redis
import json
import logging
import boto3

from uuid import uuid4
from random import randint

logger = logging.getLogger()
logger.setLevel(logging.INFO)

DEFAULT_GROUP_TTL = 3600

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


def update_group(rds, group_id, member_id, user_uuid):
    try:
        current_group_data = json.loads(rds.get(name=group_id))
    except:
        logger.info('Group %s not found.' % (group_id))
        return None

    member_list = current_group_data['members'].keys()
    logger.info('Member list: %s' % (member_list))

    if member_id in member_list:
        current_group_data['members'][member_id] = user_uuid
        rds.setex(name=group_id, value=json.dumps(current_group_data), time=DEFAULT_GROUP_TTL)
        rds.setex(name=member_id, value=user_uuid, time=DEFAULT_GROUP_TTL)
        current_group_data = json.loads(rds.get(name=group_id))

        logger.info('Current group data: ' + str(current_group_data))
    
        return group_id
    else:
        return None


def lambda_handler(event, context):
    rds = connect_to_cache()
    
    if not rds:
        return
    
    group_id = event.get('group_id', '')
    member_id = event.get('member_id', '')
    user_uuid = event.get('user_uuid', '')

    logger.info('Joining group: %s '  % group_id)

    if update_group(rds, group_id, member_id, user_uuid):
        return group_id
    else:
        return None

def run():
    test_event = {
        "group_id": "group:f9b1cd9f-8403-400b-bdd3-a62d84ab39c3",
        "member_id": "group_member:6b841755-d7b8-4594-a9e2-03eb0d67888d",
        "user_uuid": "private:4b4808fc-dec7-41de-bd7f-1327cab4e139"
    }
    
    test_context = {
    }

    response = lambda_handler(test_event, test_context)
    print('\nResponse: \n')
    print(response)

if __name__ == '__main__':run()