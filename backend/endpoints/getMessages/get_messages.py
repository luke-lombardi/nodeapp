'''
    endpoint: /fyb/getMessages
    method: POST
    format: application/json

    description:

'''

import redis
import json
import logging
import datetime
import operator

logger = logging.getLogger()
logger.setLevel(logging.INFO)


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


def get_messages(rds, node_id, user_uuid):
    messages = []
    node_exists = rds.exists(node_id)

    if node_exists:
        messages_ttl = rds.ttl(node_id)

        logging.info('Node %s exists, posting message', node_id)

        node_uuid = node_id.split(':')[1]
        messages_exist = rds.exists('messages:' + node_uuid)

        if not messages_exist:
            logging.info('No messages yet')
        else:
            messages = json.loads(rds.get('messages:' + node_uuid))
            logging.info('Existing messages: %s' % (messages))

    return messages


def lambda_handler(event, context):
    rds = connect_to_cache()
    
    if not rds:
        return
    
    node_id = event.get('node_id', 0)
    user_uuid = event.get('user_uuid', None)

    user_exists = rds.exists('private:' + user_uuid)

    if not user_exists:
        logging.info('User %s does not exist')
        return False

    logging.info('User %s exists, proceeding to get messages' % (user_uuid))
    
    messages = []

    if node_id:
        messages = get_messages(rds, node_id, user_uuid)

    if messages:
        messages.sort(key=operator.itemgetter('timestamp'), reverse=True)

    return messages


def run():
    test_event = {
        "node_id": "private:042bd76f-3e74-4b1d-8c15-5576375ee77d",
        "user_uuid": "922eaac5-0f6c-43a1-a338-3d10bf1d0368"
    }
    
    test_context = {

    }

    response = lambda_handler(test_event, test_context)
    print(response)

    
    

if __name__ == '__main__':run()