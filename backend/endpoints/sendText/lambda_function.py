'''
    endpoint: /fyb/sendText
    method: POST
    format: application/json

    description:

        Calls the Twilio API with a contact name, phone number, and referral ID. 
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
from twilio.rest import Client

logger = logging.getLogger()
logger.setLevel(logging.INFO)

local_env = os.environ.get('LOCAL_ENV', 0)

if local_env:
  from config_LOCAL import Config as ConfigDev
else:
  from config_DEV import Config as ConfigDev
  from config_PROD import Config as ConfigProd


# Twillio API client setup 
# TODO: store these credentials as lambda environmental variables instead of hardcoding them here
auth_token = 'f5e0cfde0c24875afcf23f014f557476' 
account_sid = 'ACf56b737ada2724fc5397b444bc18b229'

DEFAULT_ACK_TTL = 3600 # 1 hr

# Regular expressions for contact information validation
VALIDATION_REGEX = {
    "name": re.compile(r'^[a-zA-Z ]+$'),
    "phone": re.compile(r'.*?(\(?\d{3}\D{0,3}\d{3}\D{0,3}\d{4}).*?', flags=re.S),
    # "user_uuid": re.compile('[0-9a-f]{8}\-[0-9a-f]{4}\-[0-9a-f]{4}\-[0-9a-f]{4}\-[0-9a-f]{12}', re.I)
} 


def validate_contact_info(contact_info):
    print(contact_info)
    validated_fields = ["phone", "name"]

    # Iterate through validated fields and check:

    # A.) If they exist at all
    # B.) If they match the specified format

    for current_field in validated_fields:
        current_value = contact_info.get(current_field, None)
        if not current_value:
            return False
        else:
            m = re.search(VALIDATION_REGEX[current_field], current_value)
            if not m:
                return False
    
    return True


# Sends a text to the desired phone number, and set a key in the redis cache which serves as an ACK handshake
# When the requesting user and contacted user both set and read the key, the handshake is complete.
def send_text(contact_info, rds):
    client = Client(account_sid, auth_token) # Set this in local scope each time you connect to prevent shared memory leaks 
    message = None
    action = contact_info.get('action', None)

    logging.info("Received the following action: %s".format(action))

    if action == 'send_group_invite':
        name = contact_info["name"]
        phone = contact_info["phone"]
        member_id = contact_info["member_id"]
        group_id = contact_info["group_id"]
    
        message = client.messages.create(
            to=phone,
            from_="+12037179852",
            body="Hello %s, you were invited to join a group: \n fyb://join_group/%s/%s" % (name, group_id, member_id))

    elif action == 'share_node':
        name = contact_info["name"]
        phone = contact_info["phone"]
        node_id = contact_info["node_id"]
    
        message = client.messages.create(
            to=phone,
            from_="+12037179852",
            body="Hello %s, you were invited to track a node: \n fyb://add_node/%s" % (name, node_id))


    elif action == 'send_friend_invite':
        name = contact_info["name"]
        phone = contact_info["phone"]
        relation_id = contact_info["relation_id"]
        friend_id = contact_info["friend_id"]

        message = client.messages.create(
            to=phone,
            from_="+12037179852",
            body="Hello %s, you were invited to become friends with a guy: \n fyb://add_friend/%s/%s" % (name, relation_id, friend_id))

    if message:
        logging.info("Sent a message to {} at {}".format(name, phone))
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

    valid_contact_info = validate_contact_info(contact_info)

    if valid_contact_info:
        result = send_text(contact_info, rds)

        if not result: 
            response["error"] = "Could not send the text message."
    else:
        response["error"] = "Invalid contact information."

    return json.dumps(response)


def run():
    test_event = {
        "name": "Luke Lombardi",
        "phone": "+17184145662",
        "member_id": "group_member:f15fdf3c-4b36-4bfa-98bc-d21622563fc7",
        "group_id": "group:f15fdf3c-4b36-4bfa-98bc-d21622563fc7",
        "action": "send_group_invite",
    }
    
    test_context = {
    }

    response = lambda_handler(test_event, test_context)
    print(response)

    

if __name__ == '__main__':run()