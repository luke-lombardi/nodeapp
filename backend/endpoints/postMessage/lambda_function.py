'''
    endpoint: /fyb/postMessage
    method: POST
    format: application/json

    description:

'''

import redis
import json
import logging
import os
import datetime
import hashlib
import boto3

from modules import cache

logger = logging.getLogger()
logger.setLevel(logging.INFO)

local_env = os.environ.get('LOCAL_ENV', 0)

if local_env:
  from config_LOCAL import Config as ConfigDev
else:
  from config_DEV import Config as ConfigDev
  from config_PROD import Config as ConfigProd


RECENT_MESSAGE_TTL = 2

lambda_client = boto3.client('lambda', 
                        aws_access_key_id='AKIAJTWJKPPNEIBU4BSQ', 
                        aws_secret_access_key='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', 
                        region_name='us-east-1')


# Sends a push notification to the recipient of the message
def send_push(from_user, to_user):
    logger.info('Sending push notification...')
    person_to_alert = {}
    person_to_alert['action'] = 'send_message'
    person_to_alert['from_user'] = from_user
    person_to_alert['to_user'] = to_user
    person_to_alert['response'] = False

    invoke_response = lambda_client.invoke(FunctionName="Smartshare_sendPush",
                                          InvocationType='RequestResponse',
                                          Payload=json.dumps(person_to_alert)
                                          )

    try:
        response_data = json.loads(json.loads(invoke_response['Payload'].read()))
        error_msg = response_data['error']
    except:
        error_msg = 'unknown_error'

    if not error_msg:
        person_to_alert['response'] = True

    return person_to_alert


def post_message(rds, node_id, message, user_uuid):
    user_data = json.loads(rds.get(user_uuid).decode("utf-8"))

    node_exists = rds.exists(node_id)

    if node_exists:
        messages_ttl = rds.ttl(node_id)

        logging.info('Node %s exists, posting message', node_id)

        node_uuid = node_id.split(':')[1]
        messages_exist = rds.exists('messages:' + node_uuid)
        
        # TODO add a uuid here to hash on
        new_message = {
            "message": message,
            "user": user_uuid,
            "timestamp": datetime.datetime.now().isoformat(),
            "display_name":  user_data.get('topic', '')
        }

        # Calculate message hash to prevent duplicate messages
        str_to_hash = new_message['message'] +  new_message['user']
        message_hash = hashlib.sha1(str_to_hash.encode('utf-8')).hexdigest()
        message_exists = rds.exists('message:' + node_uuid + ':' + message_hash)
        if message_exists:
            logging.info('User has recently posted this message, not sending: %s' % (message_hash, ))
            return False
        else:
            if 'relation:' in node_id:
                rds.set(name='message:' + node_uuid + ':' + message_hash, value=True)
            else:
                rds.setex(name='message:' + node_uuid + ':' + message_hash, value=True, time=messages_ttl)


        # Handle the case where a user recently posted a message
        recent_message = rds.exists('recent_message:' + node_uuid + ':' + user_uuid)
        if recent_message:
            logging.info('User has recently posted a message, not sending')
            return False
        else:
            rds.setex(name='recent_message:' + node_uuid + ':' + user_uuid, value=True, time=RECENT_MESSAGE_TTL)


        messages = []
        if not messages_exist:
            logging.info('No messages yet, posting message')
            messages = []
            messages.append(new_message)
            
            if 'relation:' in node_id:
                rds.set(name='messages:' + node_uuid, value=json.dumps(messages))
            else:
                # Update the messages on the node
                rds.setex(name='messages:' + node_uuid, value=json.dumps(messages), time=messages_ttl)

        else:
            messages = json.loads(rds.get('messages:' + node_uuid))
            logging.info('Existing messages: %s' % (messages))

            messages.append(new_message)
            
            if 'relation:' in node_id:
                rds.set(name='messages:' + node_uuid, value=json.dumps(messages))
            else:
                rds.setex(name='messages:' + node_uuid, value=json.dumps(messages), time=messages_ttl)

        # Update the message count on the node (for a badge on the market)
        total_messages = len(messages)
        node_data = json.loads(rds.get(node_id))
        node_data['total_messages'] = total_messages
        current_ttl = rds.ttl(node_id)

        if 'relation:' in node_id:
            rds.set(name=node_id, value=json.dumps(node_data))
        else:
            rds.setex(name=node_id, value=json.dumps(node_data), time=current_ttl)
    
    else:
        logging.info('Node %s does not exist', node_id)
        return False

    if 'relation:' in node_id:
        to_user = None
        relation_data = json.loads(rds.get(node_id).decode("utf-8"))
        if relation_data:
            for member in relation_data['member_data'].keys():
                if member != user_uuid:
                    to_user = member

        if to_user:
            logger.info("Sending notification to user {}".format(to_user))
            send_push(user_uuid, to_user)
  
    return True


def lambda_handler(event, context):
    result = False

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
    
    node_id = event.get('node_id', 0)
    message = event.get('message', None)
    user_uuid = event.get('user_uuid', None)

    user_exists = rds.exists(user_uuid)

    if not user_exists:
        logging.info('User %s does not exist' % (user_uuid))
        return False

    logging.info('User %s exists, proceeding to post message on node %s' % (user_uuid, node_id))
    
    if node_id and message:
        result = post_message(rds, node_id, message, user_uuid)

    return result


def run():
    test_event = {
        "node_id": "private:042bd76f-3e74-4b1d-8c15-5576375ee77d",
        "message": "some message",
        "user_uuid": "922eaac5-0f6c-43a1-a338-3d10bf1d0368"
    }
    
    test_context = {

    }

    response = lambda_handler(test_event, test_context)
    print(response)

    
    

if __name__ == '__main__':run()