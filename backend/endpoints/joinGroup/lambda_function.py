'''
    endpoint: /fyb/joinGroup
    method: POST
    format: application/json

    description:

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

DEFAULT_GROUP_TTL = 3600


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
        rds.setex(name=member_id, value='private:' + user_uuid, time=DEFAULT_GROUP_TTL)
        current_group_data = json.loads(rds.get(name=group_id))

        logger.info('Current group data: ' + str(current_group_data))
    
        return group_id
    else:
        return None


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
    
    logger.info('Event payload: %s' % (event))

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