'''
    endpoint: /fyb/sendPush
    method: POST
    format: application/json

    description:

        
'''

import redis
import json
import logging
import re
import os

from uuid import uuid4
from random import randint
from modules import cache
from http import HTTPStatus
from pushy import PushyAPI

logger = logging.getLogger()
logger.setLevel(logging.INFO)

local_env = os.environ.get('LOCAL_ENV', 0)

if local_env:
  from config_LOCAL import Config as ConfigDev
else:
  from config_DEV import Config as ConfigDev
  from config_PROD import Config as ConfigProd


# Pushy API setup 

DEFAULT_ACK_TTL = 3600 # 1 hr

# Regular expressions for contact information validation
VALIDATION_REGEX = {
    # "user_uuid": re.compile('[0-9a-f]{8}\-[0-9a-f]{4}\-[0-9a-f]{4}\-[0-9a-f]{4}\-[0-9a-f]{12}', re.I)
} 


def send_push(push_info, rds):
    message = None
    action = push_info.get('action', None)

    logging.info("Received the following action: %s".format(action))

    # if action == 'send_group_invite':
    #     name = contact_info["name"]
    #     phone = contact_info["phone"]
    #     member_id = contact_info["member_id"]
    #     group_id = contact_info["group_id"]
    
    #     message = client.messages.create(
    #         to=phone,
    #         from_="+12037179852",
    #         body="Hello %s, you were invited to join a group: \n fyb://join_group/%s/%s" % (name, group_id, member_id))

    # elif action == 'share_node':
    #     name = contact_info["name"]
    #     phone = contact_info["phone"]
    #     node_id = contact_info["node_id"]
    
    #     message = client.messages.create(
    #         to=phone,
    #         from_="+12037179852",
    #         body="Hello %s, you were invited to track a node: \n fyb://add_node/%s" % (name, node_id))


    if action == 'send_friend_invite':
        
        relation_id = push_info["relation_id"]
        friend_id = push_info["friend_id"]
        data = {'message': 'Hello World!'}
        to = ['cdd92f4ce847efa5c7f']

        options = { 
            'notification': {
                'badge': 1,
                'sound': 'ping.aiff',
                'body': u'Hello World \u270c'
            }
        }

        # Send the push notification
        PushyAPI.sendPushNotification(data, to, options)


    if message:
        logging.info("Sent a push notificiation to {}".format(friend_id))
        return True
    
    return False


def lambda_handler(contact_info, context):
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

    response = {
        "error": ""
    }

    if not rds:
        response["error"] = "Could not connect to redis cache."
        return json.dumps(response)

    valid_user = True

    if valid_user:
        result = send_push(contact_info, rds)

        if not result: 
            response["error"] = "Could not send the push notification."
    else:
        response["error"] = "Invalid request."

    return json.dumps(response)


def run():
    test_event = {
        "action": "send_friend_invite",
    }
    
    test_context = {
    }

    response = lambda_handler(test_event, test_context)
    print(response)

    

if __name__ == '__main__':run()