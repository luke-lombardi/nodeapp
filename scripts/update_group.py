'''
    endpoint: /fyb/updateGroup
    method: POST
    format: application/json

    description:

'''

import redis
import json
import logging
import boto3
import pprint

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


# Update the actual group data in the cache
def update_group(rds, group_id, group_data):
    ttl = int(group_data.get("ttl", None))
    if ttl:
        ttl = ttl * 3600
    else:
        ttl = DEFAULT_GROUP_TTL

    rds.setex(name=group_id, value=json.dumps(group_data), time=ttl)
    return group_id


# Sends joining info to each new group member via text
def send_texts_to_new_members(people_to_invite, group_id):
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

    return [ person for person in people_to_invite if person['response'] == True ]


# Generate unique ids for each member in the group - these will be associated with their private UUIDs when they join
def create_uuids_for_new_members(rds, people_to_invite):
    members = []

    for idx, person in enumerate(people_to_invite):
        # print(person)
        member_id = get_new_uuid(rds, 'group_member:')
        members.append(member_id)
        people_to_invite[idx]['member_id'] = member_id

    return (members, people_to_invite)


def update_group(rds, group_id, current_group_data, new_members, new_people_to_invite):
    for member_id in new_members:
        current_group_data['members'][member_id] = None

    ttl = current_group_data['ttl']

    # Update the group with new member data
    rds.setex(name=group_id, value=json.dumps(current_group_data), time=ttl)

    current_group_data = json.loads(rds.get(name=group_id))
    logger.info('Updated group data: ' + str(current_group_data))


def remove_members(current_group_data, people_to_remove):
    for member_id in people_to_remove:
        current_group_data['members'].pop(member_id, None)
        
        current_people = current_group_data.get('people', [])
        idx = -1
        for idx, person in enumerate(current_people):
            if person['member_id'] == member_id:
                break
        
        if idx >= 0:
            del current_people[idx]

    return current_group_data


def lambda_handler(event, context):
    pp = pprint.PrettyPrinter(indent=4)

    rds = connect_to_cache()
    
    if not rds:
        return
    
    logger.info('Event payload: ' + str(event))

    # First, we have to create a list of 'mirror' UUIDs to associate w/ user UUIDS in our group
    people_to_invite = event.get('people', [])
    people_to_remove = event.get('people_to_remove', [])

    # Filter out the people w/ valid member UUIDs, find people we need to invite
    new_people_to_invite = [person for person in people_to_invite if not person.get('member_id', None)]
    new_members, new_people_to_invite = create_uuids_for_new_members(rds, new_people_to_invite)

    group_id = event.get('group_id', None)

    if not group_id:
        return None
    
    new_ttl = int(event.get("ttl", None))
    if new_ttl:
        new_ttl = new_ttl * 3600
    else:
        new_ttl = DEFAULT_GROUP_TTL

    # add the new group members to the 'people' list object
    current_group_data = json.loads(rds.get(name=group_id))
    current_group_data['people'].extend(new_people_to_invite)
    current_group_data['ttl'] = new_ttl

    if people_to_remove:
        current_group_data = remove_members(current_group_data, people_to_remove)
    
    new_people_to_invite = send_texts_to_new_members(new_people_to_invite, group_id)
    update_group(rds, group_id, current_group_data, new_members, new_people_to_invite)     # Then, update the cache with members whose requests worked

    return group_id


def run():
    test_event = {
        "group_data": {
            "title": "new group",
            "type": "group",
            "public": False,
            "owner": "private:7d8b17e8-e944-4869-b3e5-0730bed5ed89",
            "members": {},
            "ttl": 3600
        },
        "people_to_invite": [
            {
                "name": "Luke Lombardi",
                "phone": "+17184145662",
            },
            {
                "name": "Johnny Appleseed",
                "phone": "(347) 302-4504",
            },
        ]
    }


    test_context = {
    }

    response = lambda_handler(test_event, test_context)
    print('\nResponse: \n')
    print(response)

    
    

if __name__ == '__main__':run()