'''
    endpoint: /fyb/getMessages
    method: POST
    format: application/json

    description:

'''

import redis
import json
import logging
import os
import datetime
import operator

from modules import cache

logger = logging.getLogger()
logger.setLevel(logging.INFO)

local_env = os.environ.get('LOCAL_ENV', 0)

if local_env:
  from config_LOCAL import Config as ConfigDev
else:
  from config_DEV import Config as ConfigDev
  from config_PROD import Config as ConfigProd


def get_messages(rds, node_id, user_uuid):
    messages = []
    node_exists = rds.exists(node_id)

    if node_exists:
        messages_ttl = rds.ttl(node_id)

        logging.info('Node %s exists, getting messages', node_id)

        node_uuid = node_id.split(':')[1]
        messages_exist = rds.exists('messages:' + node_uuid)

        if not messages_exist:
            logging.info('No messages yet')
        else:
            messages = json.loads(rds.get('messages:' + node_uuid))
            logging.info('Existing messages: %s' % (messages))

    return messages


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

    node_id = event.get('node_id', 0)
    user_uuid = event.get('user_uuid', None)

    user_exists = rds.exists(user_uuid)

    if not user_exists:
        logging.info('User %s does not exist'  % (user_uuid))
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