'''
    endpoint: /fyb/addFriend
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


DEFAULT_INVITE_TTL = 3600 * 72

lambda_client = boto3.client('lambda', 
                        aws_access_key_id='AKIAJTWJKPPNEIBU4BSQ', 
                        aws_secret_access_key='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', 
                        region_name='us-east-1')

# Ensures the uuid is unique... kind of overkill
def get_new_uuid(rds, prefix):
    new_uuid = prefix + str(uuid4())
    while rds.exists(prefix + str(new_uuid)):
        new_uuid = prefix + str(uuid4())
    return new_uuid

# Create the actual group in the cache
def insert_relation(rds, relation_id, sender_id, sender_friend_id, rcpt_id, rcpt_friend_id):
    logger.info("Inserting relation w/ sender: {} and rcpt: {}".format(sender_id, rcpt_id))
    sender_node_data = json.loads(rds.get(sender_id))
    rcpt_node_data = json.loads(rds.get(rcpt_id))

    relation_data = {
        'members': {
            sender_friend_id: True,
            rcpt_friend_id: False
        },
        'member_data': {
            sender_id: {
              'friend_id': sender_friend_id,
              'topic': sender_node_data.get('topic', ''),
            },
            rcpt_id: {
              'friend_id': rcpt_friend_id,
              'topic': rcpt_node_data.get('topic', '')
            }
        },
        'status': 'pending',
    }

    logger.info('Inserting this relation data into cache: %s' % (relation_data))
    ret = rds.set(name=relation_id, value=json.dumps(relation_data))
    return ret

def create_mirror_node(rds, private_uuid, friend_id, share_location=False):
    logger.info('Creating a mirror node, location sharing: %s' % (share_location))
    if not share_location:
        ret = rds.set(name=friend_id, value='hidden')
    else:
        ret = rds.set(name=friend_id, value=private_uuid)
    return ret

# Sends a push notification to the recipient of the friend request
def send_push(person_to_invite, relation_id, from_user, to_user, to_user_friend_id):
    logger.info('Sending push notification...')

    person_to_invite['relation_id'] = relation_id
    person_to_invite['friend_id'] = to_user_friend_id
    person_to_invite['action'] = 'send_friend_invite'
    person_to_invite['from_user'] = from_user
    person_to_invite['to_user'] = to_user
    person_to_invite['response'] = False

    invoke_response = lambda_client.invoke(FunctionName="Smartshare_sendPush",
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
    }
    
    response = {
        'relation_id': '',
        'your_id': '',
        'error_msg': '',
        'their_id': ''
    }
    
    logger.info('Event payload: ' + str(event))

    # Grab the details of the person we are inviting
    person_to_invite = event.get('person_to_invite', {})

    # Get a new ID for the relationship
    relation_id = get_new_uuid(rds, 'relation:')

    logging.info('Received invite data: %s', event)

    sender_uuid = event.get('from', None)
    sender_friend_id = None

    share_location = event.get('share_location', False)

    # If there is a valid 'from' user id, then create a new mirror node for them
    if sender_uuid:
        logger.info('Invite is from: %s, creating new ID for them' % (sender_uuid))
        logger.info('Sharing location? %s ' %  (share_location))
        sender_friend_id = get_new_uuid(rds, 'friend:')
        ret = create_mirror_node(rds, sender_uuid, sender_friend_id, share_location = share_location)

        # If the node was created and inserted properly, add it to the response body
        if ret:
            logger.info('Cache insert success : %s : %s' % (sender_friend_id , ret))
            response['your_id'] = sender_friend_id
        else:
            response['error_msg'] = ERROR_MSG['CACHE_ERROR']
            logger.info('Error inserting into cache, response was: %s' % (ret))
            return response
    
    # Create an ID/mirror node for the recipient user
    rcpt_uuid = event.get('to', None)
    rcpt_friend_id = get_new_uuid(rds, 'friend:')

    # Insert it into the cache
    ret = create_mirror_node(rds, None, rcpt_friend_id, share_location=False)
    if ret:
        logger.info('Cache insert success : %s : %s' % (rcpt_friend_id , ret))
        response['their_id'] = rcpt_friend_id
    else:
        response['error_msg'] = ERROR_MSG['CACHE_ERROR']
        logger.info('Error inserting into cache, response was: %s' % (ret))
        return response
    

    # Add the relation to the cache
    ret = insert_relation(rds, relation_id, sender_uuid, sender_friend_id, rcpt_uuid, \
    rcpt_friend_id)

    if ret:
        logger.info('Cache insert success: %s' % (ret))
        response['relation_id'] = relation_id
    else:
        logger.info('Error inserting into cache, response was: %s' % (ret))
        return response

    logging.info('Create a new relation: %s', relation_id)

    # Last, we have to a text to recipient friend
    members = send_push(person_to_invite, relation_id, sender_uuid, rcpt_uuid, rcpt_friend_id)

    return response


def run():
    test_event = {
            "from": "private:7d8b17e8-e944-4869-b3e5-0730bed5ed89",
            "to": "private:88c162b0-eeda-4cde-9d7b-92ec0b361d82",
    }
    
    test_context = {
    }

    response = lambda_handler(test_event, test_context)
    print('\nResponse: \n')
    print(response)

    
    

if __name__ == '__main__':run()