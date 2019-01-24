'''
    endpoint: /toggleLocationSharing
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


def toggle_location_tracking(rds, friend_id, user_id, relation_id):
    try:
        current_relation_data = json.loads(rds.get(name=relation_id))
    except:
        logger.info('Relation %s not found.' % (relation_id))
        return False
      
    current_status = None

    if friend_id in current_relation_data['members'].keys():
        if rds.exists(friend_id):
            current_status = rds.get(friend_id).decode('utf-8')
            if current_status == 'hidden':
                rds.set(name=friend_id, value=user_id)
            else:
                rds.set(name=friend_id, value='hidden')
            
            return True
  

def lambda_handler(event, context):
    ERROR_MSG = {
        'CACHE_ERROR': 'Could not connect to cache',
    }
    
    response = {
        'relation_id': '',
        'result': False,
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

    friend_id = event.get('friend_id', '')
    user_id = event.get('user_id', '')
    relation_id = event.get('relation_id', '')

    response['relation_id'] = relation_id

    logger.info('Toggling location tracking for: %s ' % (friend_id))

    result = toggle_location_tracking(rds, friend_id, user_id, relation_id)
    if result:
        logger.info('Success, toggled location tracking for %s' % (friend_id))
        response['result'] = True
        return response
    else:
        response['error_msg'] = ERROR_MSG['CACHE_ERROR']
        return response

def run():
    test_event = {
        'relation_id': 'relation:59fde047-07f8-475e-9263-f351176681c2',
        'friend_id': '',
        'user_id': '',
    }
    
    test_context = {
    }

    response = lambda_handler(test_event, test_context)
    print('\nResponse: \n')
    print(response)

if __name__ == '__main__':run()