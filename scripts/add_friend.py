'''
    endpoint: /fyb/addFriend
    method: POST
    format: application/json

    description:


'''

import redis
import json
import logging
import boto3

from uuid import uuid4
from random import randint

logger = logging.getLogger()
logger.setLevel(logging.INFO)

DEFAULT_INVITE_TTL = 3600 * 72

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
def insert_relation(rds, relation_id, from_user_friend_id, to_user_friend_id):
    relation_data = {
        'members': {
            from_user_friend_id: True,
            to_user_friend_id: False
        }
    }

    logger.info('Inserting this relation data into cache: %s' % (relation_data))
    ret = rds.setex(name=relation_id, value=json.dumps(relation_data), time=DEFAULT_INVITE_TTL)
    return ret

def create_mirror_node(rds, private_uuid, friend_id):
    ret = rds.set(name=friend_id, value=private_uuid)
    return ret

# Sends a text to the recipient of the friend request
def send_text(person_to_invite, relation_id, to_user_friend_id):
    logger.info('Sending text to friend...')

    person_to_invite['relation_id'] = relation_id
    person_to_invite['friend_id'] = to_user_friend_id
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
    ERROR_MSG = {
        'CACHE_ERROR': 'Could not connect to cache',
        'INVALID_GROUP_ID': 'Please specify a valid group ID',
    }

    rds = connect_to_cache()
    
    if not rds:
        return
    
    response = {
        'relation_id': '',
        'your_id': '',
        'their_id': '',
        'error_msg': ''
    }
    
    logger.info('Event payload: ' + str(event))

    # Grab the details of the person we are inviting
    person_to_invite = event.get('person_to_invite', {})

    # Get a new ID for the relationship
    relation_id = get_new_uuid(rds, 'relation:')

    invite_data = event.get('invite_data', {})

    logging.info('Received invite data: %s', invite_data)

    from_user = invite_data.get('from', None)

    # If there is a valid 'from' user id, then create a new mirror node for them
    if from_user:
        logger.info('Invite is from: %s, creating new ID for them' % (from_user))
        from_user_friend_id = get_new_uuid(rds, 'friend:')
        ret = create_mirror_node(rds, from_user, from_user_friend_id)

        # If the node was created and inserted properly, add it to the response body
        if ret:
            logger.info('Cache insert success: %s' % (ret))
            response['your_id'] = from_user_friend_id
        else:
            response['error_msg'] = ERROR_MSG['CACHE_ERROR']
            logger.info('Error inserting into cache, response was: %s' % (ret))
            return response
    
    # Create an ID/mirror node for the receipient user
    to_user = None
    to_user_friend_id = get_new_uuid(rds, 'friend:')

    # Insert it into the cache
    ret = create_mirror_node(rds, to_user, to_user_friend_id)
    if ret:
        logger.info('Cache insert success: %s' % (ret))
    else:
        response['error_msg'] = ERROR_MSG['CACHE_ERROR']
        logger.info('Error inserting into cache, response was: %s' % (ret))
        return response
    
    # Add the relation to the cache
    ret = insert_relation(rds, relation_id, from_user_friend_id, to_user_friend_id)
    if ret:
        logger.info('Cache insert success: %s' % (ret))
        response['relation_id'] = relation_id
        response['their_id'] = to_user_friend_id
    else:
        logger.info('Error inserting into cache, response was: %s' % (ret))
        return response

    logging.info('Create a new relation: %s', relation_id)

    # Last, we have to a text to recipient friend
    members = send_text(person_to_invite, relation_id, to_user_friend_id)

    return response


def run():
    test_event = {
        "invite_data": {
            "from": "private:7d8b17e8-e944-4869-b3e5-0730bed5ed89",
            "to": None,
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