'''
    endpoint: /fyb/acceptFriend
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


def update_relation(rds, relation_id, friend_id, user_uuid):
    try:
        current_relation_data = json.loads(rds.get(name=relation_id))
    except:
        logger.info('Relation %s not found.' % (relation_id))
        return None

    member_list = current_relation_data['members'].keys()
    logger.info('Member list: %s' % (member_list))

    if friend_id in member_list:
        logger.info('Member found in %s... accepting relation' % (member_list))

        current_relation_data['members'][friend_id] = True

        rds.set(name=relation_id, value=json.dumps(current_relation_data))
        rds.set(name=friend_id, value=user_uuid)
    
        current_relation_data = json.loads(rds.get(name=relation_id))
        logger.info('Current relation data: ' + str(current_relation_data))
    
        return True
    else:
        return False


def lambda_handler(event, context):
    ERROR_MSG = {
        'CACHE_ERROR': 'Could not connect to cache',
        'INVALID_GROUP_ID': 'Please specify a valid group ID',
    }
    
    response = {
        'relation_id': '',
        'friend_id': '',
        'error_msg': ''
    }

    rds = connect_to_cache()
    
    if not rds:
        response['error_msg'] = ERROR_MSG['CACHE_ERROR']
        return response
    
    relation_id = event.get('relation_id', '')
    friend_id = event.get('friend_id', '')
    user_uuid = event.get('user_uuid', '')

    logger.info('Accepting friend invite: %s '  % relation_id)

    ret = update_relation(rds, relation_id, friend_id, user_uuid)
    if ret:
        logger.info('Success, returning relation ID %s ' % (relation_id))
        response['relation_id'] = relation_id
        response['friend_id'] = friend_id
        return response
    else:
        response['error_msg'] = ERROR_MSG['CACHE_ERROR']
        return response

def run():
    test_event = {
        "relation_id": "relation:0931cbfa-724a-4ce6-80ce-cb6f7950b493",
        "friend_id": "friend:aab574a7-af12-40c7-a1f2-1789cfc727e4",
        "user_uuid": "private:4b4808fc-dec7-41de-bd7f-1327cab4e139"
    }
    
    test_context = {
    }

    response = lambda_handler(test_event, test_context)
    print('\nResponse: \n')
    print(response)

if __name__ == '__main__':run()