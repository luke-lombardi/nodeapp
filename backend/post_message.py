'''
    endpoint: /fyb/postMessage
    method: POST
    format: application/json

    description:

'''

import redis
import json
import logging
import datetime
import hashlib

logger = logging.getLogger()
logger.setLevel(logging.INFO)


RECENT_MESSAGE_TTL = 2

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


def post_message(rds, node_id, message, user_uuid):

    node_exists = rds.exists(node_id)

    if node_exists:
        messages_ttl = rds.ttl(node_id)

        logging.info('Node %s exists, posting message', node_id)

        node_uuid = node_id.split(':')[1]
        messages_exist = rds.exists('messages:' + node_uuid)
        
        # TODO add a uuid here to hash on
        new_message = {
            "message": message,
            "user": "private:" + user_uuid,
            "timestamp": datetime.datetime.now().isoformat(),
        }

        # Calculate message hash to prevent duplicate messages
        str_to_hash = new_message['message'] +  new_message['user']
        message_hash = hashlib.sha1(str_to_hash.encode('utf-8')).hexdigest()
        message_exists = rds.exists('message:' + node_uuid + ':' + message_hash)
        if message_exists:
            logging.info('User has recently posted this message, not sending: %s' % (message_hash, ))
            return False
        else:
            rds.setex(name='message:' + node_uuid + ':' + message_hash, value=True, time=messages_ttl)

        # Handle the case where a user recently posted a message
        recent_message = rds.exists('recent_message:' + node_uuid + ':' + user_uuid)
        if recent_message:
            logging.info('User has recently posted a message, not sending')
            return False
        else:
            rds.setex(name='recent_message:' + node_uuid + ':' + user_uuid, value=True, time=RECENT_MESSAGE_TTL)



        if not messages_exist:
            logging.info('No messages yet, posting message')
            messages = []
            messages.append(new_message)
            rds.setex(name='messages:' + node_uuid, value=json.dumps(messages), time=messages_ttl)

        else:
            messages = json.loads(rds.get('messages:' + node_uuid))
            logging.info('Existing messages: %s' % (messages))

            messages.append(new_message)
            rds.setex(name='messages:' + node_uuid, value=json.dumps(messages), time=messages_ttl)
    else:
        logging.info('Node %s does not exist', node_id)
        return False

    return True


def lambda_handler(event, context):
    result = False
    rds = connect_to_cache()
    
    if not rds:
        return
    
    node_id = event.get('node_id', 0)
    message = event.get('message', None)
    user_uuid = event.get('user_uuid', None)

    user_exists = rds.exists('private:' + user_uuid)

    if not user_exists:
        logging.info('User %s does not exist')
        return False

    logging.info('User %s exists, proceeding to post message' % (user_uuid))
    
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