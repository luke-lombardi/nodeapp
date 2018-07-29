'''
    endpoint: /fyb/sendText
    method: POST
    format: application/json

    description:

        Calls the Twilio API with a contact name, phone number, and referral ID. 
'''

import json
import logging
import redis
import re

from http import HTTPStatus
from twilio.rest import Client

logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Twillio API client setup 
# TODO: store these credentials as lambda environmental variables instead of hardcoding them here
auth_token = 'f5e0cfde0c24875afcf23f014f557476' 
account_sid = 'ACf56b737ada2724fc5397b444bc18b229'

DEFAULT_ACK_TTL = 3600 # 1 hr

# Regular expressions for contact information validation
VALIDATION_REGEX = {
    "name": re.compile(r'^[a-zA-Z ]+$'),
    "phone": re.compile(r'.*?(\(?\d{3}\D{0,3}\d{3}\D{0,3}\d{4}).*?', flags=re.S),
    "user_uuid": re.compile('[0-9a-f]{8}\-[0-9a-f]{4}\-[0-9a-f]{4}\-[0-9a-f]{4}\-[0-9a-f]{12}', re.I)
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


def validate_contact_info(contact_info):
    print(contact_info)
    validated_fields = ["phone", "name", "user_uuid"]

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
                print('hey')
                print(current_field)
                return False
    
    return True


# Sends a text to the desired phone number, and set a key in the redis cache which serves as an ACK handshake
# When the requesting user and contacted user both set and read the key, the handshake is complete.
def send_text(contact_info, rds):
    client = Client(account_sid, auth_token) # Set this in local scope each time you connect to prevent shared memory leaks 

    name = contact_info["name"]
    phone = contact_info["phone"]
    user_uuid = contact_info["user_uuid"]

    message = client.messages.create(
        to=phone,
        from_="+12037179852",
        body="Hello %s, your boy is tryna find you. \n fyb://%s" % (name,user_uuid))

    if message:
        logging.info("Sent a message to {} at {}".format(name, phone))

        # When user accepts set key to their uuid - then set ttl on the key
        # The uuid that was read on both sides is stored in friends list and monitored by node_id, which is same as uuid
        rds.setex(name=user_uuid, value='', time=DEFAULT_ACK_TTL) # TODO: check return code of the key set?
        return True
    else:        
        logging.error('Could not send text to: ' + str())
        return False


def lambda_handler(event, context):
    rds = connect_to_cache()
    response = {
        "error": ""
    }

    if not rds:
        response["error"] = "Could not connect to redis cache."
        return json.dumps(response)
    
    contact_info = event.get('contact_info', None)

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
        "contact_info": {
            "name": "Johnny Appleseed",
            "phone": "+13473024504",
            "user_uuid": "11ac3748-448d-4d9e-a7bc-58f0ec0a2068"
        }
    }
    
    test_context = {
    }

    response = lambda_handler(test_event, test_context)
    print(response)

    

if __name__ == '__main__':run()