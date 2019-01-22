'''
    endpoint: /acceptFriend
    method: POST
    format: application/json

    description:
'''

import redis
import json
import logging
import os

from modules import cache
from uuid import uuid4
from random import randint

logger = logging.getLogger()
logger.setLevel(logging.INFO)

local_env = os.environ.get('LOCAL_ENV', 0)

if local_env:
  from config_LOCAL import Config as ConfigDev
else:
  from config_DEV import Config as ConfigDev
  from config_PROD import Config as ConfigProd


DEFAULT_GROUP_TTL = 3600


def update_relation(rds, relation_id, your_id, user_uuid):
    try:
        current_relation_data = json.loads(rds.get(name=relation_id))
    except:
        logger.info('Relation %s not found.' % (relation_id))
        return None

    member_list = current_relation_data['members'].keys()
    logger.info('Member list: %s' % (member_list))

    member_found = False
    their_id = None

    for member in member_list:
        if your_id == member:

            member_found = True

            logger.info('Member found in %s... accepting relation' % (member_list))

            current_relation_data['members'][your_id] = True
            current_relation_data['status'] = 'accepted'

            rds.set(name=relation_id, value=json.dumps(current_relation_data))

            logger.info('Friend ID: %s, User UUID: %s' % (your_id, user_uuid))

            rds.set(name=your_id, value=user_uuid)
        
            current_relation_data = json.loads(rds.get(name=relation_id))
            logger.info('Current relation data: ' + str(current_relation_data))
        else:
            their_id = member

    if member_found:
        return their_id
    else:
        return None


def lambda_handler(event, context):
    ERROR_MSG = {
        'CACHE_ERROR': 'Could not connect to cache',
        'INVALID_GROUP_ID': 'Please specify a valid group ID',
    }
    
    response = {
        'relation_id': '',
        'their_id': '',
        'your_id': '',
        'error_msg': ''
    }

    logger.info('Event payload: %s' % (event))

    # if we are running locally, use the DEV config file
    if not context:
        rds = cache.connect_to_cache('DEV')
    else:
        # choose which config file to use based on the invoked function ARN
        context_vars = vars(context)
        alias = context_vars['invoked_function_arn'].split(':')[-1]

        if alias == 'PROD':
            rds = cache.connect_to_cache('PROD')
        else:
            rds = cache.connect_to_cache('DEV')

    if not rds:
        return


    relation_id = event.get('relation_id', '')
    your_id = event.get('your_id', '')
    user_uuid = event.get('user_uuid', '')

    logger.info('Accepting friend invite: %s '  % relation_id)

    their_id = update_relation(rds, relation_id, your_id, user_uuid)
    if their_id:
        logger.info('Success, returning relation ID %s ' % (relation_id))
        response['relation_id'] = relation_id
        response['your_id'] = your_id
        response['their_id'] = their_id
        return response
    else:
        response['error_msg'] = ERROR_MSG['CACHE_ERROR']
        return response

def run():
    test_event = {
        "relation_id": "relation:59fde047-07f8-475e-9263-f351176681c2",
        "your_id": "friend:bc09fa49-2ce7-45b0-b6f5-250e218e2664",
        "user_uuid": "private:4b4808fc-dec7-41de-bd7f-1327cab4e139"
    }
    
    test_context = {
    }

    response = lambda_handler(test_event, test_context)
    print('\nResponse: \n')
    print(response)

if __name__ == '__main__':run()