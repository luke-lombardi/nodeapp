'''
    endpoint: /fyb/likeNode
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

from modules import cache

logger = logging.getLogger()
logger.setLevel(logging.INFO)

local_env = os.environ.get('LOCAL_ENV', 0)

if local_env:
  from config_LOCAL import Config as ConfigDev
else:
  from config_DEV import Config as ConfigDev
  from config_PROD import Config as ConfigProd

MIN_SCORE = -5

def calculate_total_votes(current_votes):
    total_vote_count = 0
  
    for user_uuid, vote in current_votes.items():
        total_vote_count += current_votes[user_uuid]
  
    return total_vote_count


def vote_for_node(rds, node_id, user_uuid, vote=None):
    user_data = json.loads(rds.get(user_uuid).decode("utf-8"))

    node_exists = rds.exists(node_id)
    node_data = {}

    if node_exists:
        logging.info('Node %s exists', node_id)

        node_data = json.loads(rds.get(node_id))

        # Get the current votes on the node
        current_votes = node_data.get('votes', {})
        if vote is None:
            return node_data

        user_vote_status = current_votes.get(user_uuid, None)

        logger.info("Node data: %s", node_data)
        logger.info("User vote status: %s", user_vote_status)

        if user_vote_status is None:
          current_votes[user_uuid] = 0

        current_votes[user_uuid] += vote
        if current_votes[user_uuid] > 1:
          current_votes[user_uuid] = 1
        elif current_votes[user_uuid] < -1:
          current_votes[user_uuid] = -1

        node_data['votes'] = current_votes

        total_vote_count = calculate_total_votes(current_votes)
        if total_vote_count <= MIN_SCORE:
            logging.info("Node {} hit minimum threshold score, deleting.".format(node_id))
            rds.delete(node_id)
            return node_data

        logging.info('Node data: %s', node_data)

        current_ttl = rds.ttl(node_id)
        rds.setex(name=node_id, value=json.dumps(node_data), time=current_ttl)
    
    else:
        logging.info('Node %s does not exist', node_id)
        return None

    return node_data


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
    user_uuid = event.get('user_uuid', None)
    vote = event.get('vote', None)

    user_exists = rds.exists(user_uuid)

    if not user_exists:
        logging.info('User %s does not exist' % (user_uuid))
        return False

    logging.info('User %s exists' % (user_uuid))
    logging.info('Event payload %s' % (event))

    if node_id:
        result = vote_for_node(rds, node_id, user_uuid, vote=vote)
        logger.info("Returning this node data: %s", result)

    return result


def run():
    test_event = {
        "node_id": "public:4fadd3f2-116c-4106-9209-d72eb4cf48df",
        "user_uuid": "0b1a92f6-949d-48c0-a10d-dbc530f5a02f",
        "vote": None,
    }
    
    test_context = {

    }

    response = lambda_handler(test_event, test_context)
    print(response)

    
    

if __name__ == '__main__':run()