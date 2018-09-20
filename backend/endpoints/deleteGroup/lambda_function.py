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
import os
import boto3

from uuid import uuid4
from random import randint
from modules import cache

logger = logging.getLogger()
logger.setLevel(logging.INFO)

local_env = os.environ.get('LOCAL_ENV', 0)

if local_env:
  from config_LOCAL import Config as ConfigDev
else:
  from config_DEV import Config as ConfigDev
  from config_PROD import Config as ConfigProd

lambda_client = boto3.client('lambda', 
                        aws_access_key_id='AKIAJTWJKPPNEIBU4BSQ', 
                        aws_secret_access_key='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', 
                        region_name='us-east-1')


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
    # If we are running locally, use the DEV config file
    if not context:
        rds = cache.connect_to_cache('DEV')
    else:
        # Choose which config file to use based on the invoked function ARN
        context_vars = vars(context)
        alias = context_vars['invoked_function_arn'].split(':')[-1]

        if alias == 'PROD':
            rds = cache.connect_to_cache('PROD')
        else:
            rds = cache.connect_to_cache('DEV')

    if not rds:
        return
    
    ERROR_MSG = {
        'CACHE_ERROR': 'Could not connect to cache',
        'INVALID_GROUP_ID': 'Please specify a valid group ID',
    }

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