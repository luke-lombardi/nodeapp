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
from http import HTTPStatus
from twilio.rest import Client

logger = logging.getLogger()
logger.setLevel(logging.INFO)

auth_token = 'f5e0cfde0c24875afcf23f014f557476'
account_sid = 'ACf56b737ada2724fc5397b444bc18b229'

client = Client(account_sid, auth_token)

DEFAULT_NODE_TTL = 3600

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


def send_text(contact_info, ref_id):
    message = client.messages.create(
        to="+3473024504",
        from_="+12037179852",
        body="Hello! Your boy is tryna find you. \n http://smartshare.io/meatspin/")

    if message:
        logging.info('sent a text to my boy')
        rds.setex(uuid='', value='', time=current_ttl)
        return message
    else:
        logging.info('could not find your boy')
        return none

        # add uuid of requesting user to cache as key
        # when user accepts set key to their uuid - then set ttl on the key
        # the uuid that was read on both sides is stored in friends list and monitored by node_id, which is same as uuid

def lambda_handler(event, context):
    rds = connect_to_cache()
    
    if not rds:
        return
    
    contact_info = event.get('contact_info', {})
    ref_id = 0
    if contact_info:
        ref_id = 0
        logging.info('sent a text to my boy', contact_info)
        send_text(ref_id, contact_info)
    
    return contact_info


def run():
    test_event = {

        "contact_info": {
            "name": "Johnny Appleseed",
            "phone": "+13473024504"
        },
            "ref_id": 0,
    }
    
    test_context = {

    }

    response = lambda_handler(test_event, test_context)
    print(response)

    
    

if __name__ == '__main__':run()