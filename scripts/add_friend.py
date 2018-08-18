'''
    endpoint: /fyb/addFriend
    method: POST
    format: application/json

    description:

Insert a

'''

import redis
import json
import logging
import boto3

from uuid import uuid4
from random import randint

logger = logging.getLogger()
logger.setLevel(logging.INFO)

DEFAULT_GROUP_TTL = 3600

lambda_client = boto3.client('lambda', 
                        aws_access_key_id='AKIAJTWJKPPNEIBU4BSQ', 
                        aws_secret_access_key='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', 
                        region_name='us-east-1')

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

# Ensures the uuid is unique... kind of overkill
def get_new_uuid(rds, prefix):
    new_uuid = prefix + str(uuid4())
    while rds.exists(prefix + str(new_uuid)):
        new_uuid = prefix + str(uuid4())
    return new_uuid


# Create the actual group in the cache
def insert_invite(rds, invite_id, invite_data):
    rds.setex(name=invite_id, value=json.dumps(invite_data), time=DEFAULT_GROUP_TTL)
    return invite_id


# Sends joining info to each new friend
def send_text(person_to_invite, invite_id):
    logger.info('Sending text to friend...')

    person_to_invite['invite_id'] = invite_id
    person_to_invite['action'] = 'send_friend_invite'
    person_to_invite['response'] = False
    
    invoke_response = lambda_client.invoke(FunctionName="FYB_SendText",
                                        InvocationType='RequestResponse',
                                        Payload=json.dumps(person_to_invite)
                                        )

    try:
        response_data = json.loads(json.loads(invoke_response['Payload'].read()))
        error_msg = response_data['error']
    except:
        error_msg = 'unknown_error'

    if not error_msg:
        person_to_invite['response'] = True

    return person_to_invite


def lambda_handler(event, context):
    rds = connect_to_cache()
    
    if not rds:
        return
    
    logger.info('Event payload: ' + str(event))
    # First, we have to create a list of 'mirror' UUIDs to associate w/ user UUIDS in our group
    person_to_invite = event.get('person_to_invite', {})

    # Second, we have to create the actual group in the cache
    invite_id = get_new_uuid(rds, 'invite:')
    invite_data = event.get('invite_data', {})
    insert_invite(rds, invite_id, invite_data)
    
    logging.info('Create a new invite: %s', invite_id)

    # Third, we have to send texts to each group member w/ a group ID and their member ID
    members = send_text(person_to_invite, invite_id)

    return invite_id


def run():
    test_event = {
        "invite_data": {
            "type": "friend",
            "host": "private:7d8b17e8-e944-4869-b3e5-0730bed5ed89",
            "rcpt": None,
            "ttl": None,
        },
        "person_to_invite": {
            "name": "Luke Lombardi",
            "phone": "+17184145662",
        },
    }
    
    test_context = {
    }

    response = lambda_handler(test_event, test_context)
    print('\nResponse: \n')
    print(response)

    
    

if __name__ == '__main__':run()