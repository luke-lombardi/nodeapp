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


DEFAULT_ACK_TTL = 3600 # 1 hr

# Regular expressions for contact information validation
VALIDATION_REGEX = {
    # "user_uuid": re.compile('[0-9a-f]{8}\-[0-9a-f]{4}\-[0-9a-f]{4}\-[0-9a-f]{4}\-[0-9a-f]{12}', re.I)
} 


def send_push(push_info, rds):
    message = None
    action = push_info.get('action', None)

    logging.info("Received the following action: {}".format(action))

    # elif action == 'share_node':
    #     name = contact_info["name"]
    #     phone = contact_info["phone"]
    #     node_id = contact_info["node_id"]
    
    #     message = client.messages.create(
    #         to=phone,
    #         from_="+12037179852",
    #         body="Hello %s, you were invited to track a node: \n fyb://add_node/%s" % (name, node_id))
    
    user_uuid = push_info.get("user_id", "")
    user_node_id = 'private:' + user_uuid

    if action == 'send_friend_invite':
        relation_id = push_info["relation_id"]
        friend_id = push_info["friend_id"]

        node_exists = rds.exists(user_node_id)

        if node_exists:
          node_data = rds.get(user_node_id)

          pushy_device_token = node_data.get('device_id', '')

          data = { 'message': 'Hello World!' }
          to = [ pushy_device_token ]

          options = { 
              'notification': {
                  'badge': 1,
                  'sound': 'ping.aiff',
                  'body': u'Hello World \u270c'
              }
          }

          # Send the push notification and check the response
          response = PushyAPI.sendPushNotification(data, to, options)
          logger.info("Pushy API response: {}".format(response))

        else:
          logging.info("Node {} does not exist".format(friend_id))

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
        "relation_id": "",
        "friend_id": "",
        "user_id": "",
    }
    
    test_context = {
    }

    response = lambda_handler(test_event, test_context)
    print(response)

    

if __name__ == '__main__':run()