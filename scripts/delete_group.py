'''
    endpoint: /fyb/createGroup
    method: POST
    format: application/json

    description:

Insert a group w/ a specific title and an owner
the owner can add people, so when you call updateGroup, then

'''

import redis
import json
import logging
import boto3

from uuid import uuid4
from random import randint

logger = logging.getLogger()
logger.setLevel(logging.INFO)

lambda_client = boto3.client('lambda', 
                        aws_access_key_id='AKIAJTWJKPPNEIBU4BSQ', 
                        aws_secret_access_key='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', 
                        region_name='us-east-1')

ERROR_MSG = {
    'CACHE_ERROR': 'Could not connect to cache',
    'INVALID_GROUP_ID': 'Please specify a valid group ID',
}

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


def delete_group_members(rds, members):
    for member in members:
        logger.info('Removing %s from group... ' % (member))
        ret = rds.delete(member)
        if(ret == member):
            logger.info('Member %s ground and deleted from group... ' % (member))

def delete_group(rds, group_id):
    logger.info('Removing group %s... ' % (group_id))
    ret = rds.delete(group_id)
    if(ret == group_id):
        logger.info('Group %s found and deleted successfully... ' % (member))


def lambda_handler(event, context):
    rds = connect_to_cache()
    
    response = {
        'error_msg': '',
        'group_id': '',
    }

    if not rds:
        response['error_msg'] = ERROR_MSG['CACHE_ERROR']
        return response

    logger.info('Event payload: ' + str(event))

    group_id = event.get('group_id', None)
    if not group_id:
        logger.info('Invalid group_id... ignoring request.')
        response['error_msg'] = ERROR_MSG['INVALID_GROUP_ID']
        return response
    
    response['group_id'] = group_id
    
    # First, remove all the group members mirror nodes
    members = event.get('members', [])
    delete_group_members(rds, members)

    # Second, remove the actual group from the cache
    delete_group(rds, group_id)

    return response


def run():
    test_event = {
    }
    
    test_context = {
    }

    response = lambda_handler(test_event, test_context)
    print('\nResponse: \n')
    print(response)

    
    

if __name__ == '__main__':run()