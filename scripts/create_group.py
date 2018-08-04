'''
    endpoint: /fyb/createGroup
    method: POST
    format: application/json

    description:

Insert a group w/ a specific title and an owner
the owner can add people, so when you call updateGroup, then

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
def insert_group(rds, group_id, group_data):
    public = group_data.get("public", False)
    rds.setex(name=group_id, value=json.dumps(group_data), time=DEFAULT_GROUP_TTL)
    return group_id


# Sends joining info to each new group member via text
def send_texts_to_members(people_to_invite, group_id):
    logger.info('Sending texts to group members...')

    for idx, person in enumerate(people_to_invite):
        person['group_id'] = group_id
        person['action'] = 'send_group_invite'
        person['response'] = False
        
        invoke_response = lambda_client.invoke(FunctionName="FYB_SendText",
                                            InvocationType='RequestResponse',
                                            Payload=json.dumps(person)
                                            )

        try:
            response_data = json.loads(json.loads(invoke_response['Payload'].read()))
            error_msg = response_data['error']
        except:
            error_msg = 'unknown_error'

        if not error_msg:
            person['response'] = True

    return [person for person in people_to_invite if person['response'] == True]


# Generate unique ids for each member in the group - these will be associated with their private UUIDs when they join
def create_uuids_for_members(rds, people_to_invite):
    members = {}

    for idx, person in enumerate(people_to_invite):
        # print(person)
        member_id = get_new_uuid(rds, 'group_member:')
        members[member_id] = None
        people_to_invite[idx]['member_id'] = member_id

    return (members, people_to_invite)


# Updates the new member list w/ those whose lambda text calls have actually responded
def set_members(rds, group_id, members):
    current_group_data = json.loads(rds.get(name=group_id))

    members = {member['member_id']: None for member in members}
    current_group_data['members'] = members

    # update the group with member data
    rds.setex(name=group_id, value=json.dumps(current_group_data), time=DEFAULT_GROUP_TTL)

    current_group_data = json.loads(rds.get(name=group_id))

    logger.info('Current group data: ' + str(current_group_data))


def lambda_handler(event, context):
    rds = connect_to_cache()
    
    if not rds:
        return
    
    # First, we have to create a list of 'mirror' UUIDs to associate w/ user UUIDS in our group
    people_to_invite = event.get('people_to_invite', [])
    members, people_to_invite = create_uuids_for_members(rds, people_to_invite)

    # Second, we have to create the actual group in the cache
    group_id = get_new_uuid(rds, 'group:')
    group_data = event.get('group_data', {})
    insert_group(rds, group_id, group_data)
    
    logging.info('Create a new group: %s', group_id)

    # Third, we have to send texts to each group member w/ a group ID and their member ID
    members = send_texts_to_members(people_to_invite, group_id)
    set_members(rds, group_id, members)     # then, update the cache with members whose requests worked

    return group_id


def run():
    test_event = {
        "group_data": {
            "title": "new group",
            "type": "group",
            "public": False,
            "owner": "private:7d8b17e8-e944-4869-b3e5-0730bed5ed89",
            "members": {
            },
            "ttl": 3600
        },
        "people_to_invite": [
            {
                "name": "Luke Lombardi",
                "phone": "+17184145662",
            },
            {
                "name": "Johnny Appleseed",
                "phone": "+13473024504ss",
            },
        ]
    }
    
    test_context = {

    }

    response = lambda_handler(test_event, test_context)
    print('\nResponse: \n')
    print(response)

    
    

if __name__ == '__main__':run()