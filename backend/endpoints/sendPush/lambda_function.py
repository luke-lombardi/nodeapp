'''
	endpoint: /fyb/sendPush
	method: POST
	format: application/json

	description:

		
'''

import redis
import json
import logging
import re
import os

from uuid import uuid4
from random import randint
from modules import cache
from http import HTTPStatus
from pushy import PushyAPI

logger = logging.getLogger()
logger.setLevel(logging.INFO)

local_env = os.environ.get('LOCAL_ENV', 0)

if local_env:
  from config_LOCAL import Config as ConfigDev
else:
  from config_DEV import Config as ConfigDev
  from config_PROD import Config as ConfigProd


DEFAULT_ACK_TTL = 3600 # 1 hr

# Regular expressions for contact information validation
VALIDATION_REGEX = {
	# "user_uuid": re.compile('[0-9a-f]{8}\-[0-9a-f]{4}\-[0-9a-f]{4}\-[0-9a-f]{4}\-[0-9a-f]{12}', re.I)
} 


def send_push(push_info, rds):
	message = None
	action = push_info.get('action', None)

	logging.info("Received the following action: {}".format(action))
	
	user_uuid = push_info.get("user_id", "")
	user_node_id = user_uuid

	if action == 'send_friend_invite':
		relation_id = push_info["relation_id"]
		friend_id = push_info["friend_id"]
		from_user = push_info["from_user"]
		to_user = push_info["to_user"]

		from_node_data =  json.loads(rds.get(from_user))

		node_exists = rds.exists(friend_id)

		if node_exists:
		  user_uuid = to_user
  
		  logger.info("Recipient friend id: {}".format(friend_id))
		  logger.info("Recipient user id: {}".format(user_uuid))

		  node_data = json.loads(rds.get(user_uuid))

		  # Grab the recipient push notification device ID
		  pushy_device_token = node_data.get('device_token', '')

		  from_username = from_node_data.get('topic', 'Anonymous')

		  data = {
			  "from_username": from_username,
			  "from_user": from_user,
			  "action": "confirm_friend",
			  "relation_id": relation_id,
			  "friend_id": friend_id,
		  }
  
		  to = [ pushy_device_token ]

		  options = {
			  'notification': {
				  'badge': 1,
				  'sound': 'ping.aiff',
				  'body': "You have received a chat request from {}".format(from_username)
			  }
		  }

		  # Send the push notification and check the response
		  response = PushyAPI.sendPushNotification(data, to, options)
		  logger.info("Pushy API response: {}".format(response))

		else:
		  logging.info("Node {} does not exist".format(user_node_id))
  

	elif action == 'send_message':
		from_user = push_info["from_user"]
		to_user = push_info["to_user"]

		from_node_data =  json.loads(rds.get(from_user))

		node_exists = rds.exists(to_user)

		if node_exists:  
		  # logger.info("Recipient friend id: {}".format(friend_id))
		  logger.info("Recipient user id: {}".format(to_user))

		  node_data = json.loads(rds.get(to_user))

		  # Grab the recipient push notification device ID
		  pushy_device_token = node_data.get('device_token', '')

		  from_username = from_node_data.get('topic', 'Anonymous')
		  message = push_info['message']
		  relation_id = push_info['relation_id']
		

		  data = {
			  "from_username": from_username,
			  "from_user": from_user,
			  "relation_id": relation_id,
        "message": message,
			  "action": "got_message",
		  }
  
		  to = [ pushy_device_token ]

		  options = { 
			  'notification': {
				  'badge': 1,
				  'sound': 'ping.aiff',
				  'body': "{}: {}".format(from_username, message)
			  }
		  }

		  # Send the push notification and check the response
		  response = PushyAPI.sendPushNotification(data, to, options)
		  logger.info("Pushy API response: {}".format(response))

		else:
		  logging.info("Node {} does not exist".format(user_node_id))

	elif action == 'share_node':
		friend_id = push_info["friend_id"]
		from_user = push_info["from_user"]
		to_user = push_info["to_user"]
		node_id = push_info["node_id"]

		node_exists = rds.exists(friend_id)

		if node_exists:  
		  logger.info("Recipient friend id: {}".format(friend_id))
		  logger.info("Recipient user id: {}".format(to_user))

		  node_data = json.loads(rds.get(to_user))

		  # Grab the recipient push notification device ID
		  pushy_device_token = node_data.get('device_token', '')

		  data = {
			  "from_username": node_data.get('topic', 'Anonymous'),
			  "from_user": from_user,
			  "action": "add_node",
			  "friend_id": friend_id,
        "node_id": node_id,
		  }
  
		  to = [ pushy_device_token ]

		  options = { 
			  'notification': {
				  'badge': 1,
				  'sound': 'ping.aiff',
				  'body': u'You have received a node'
			  }
		  }

		  # Send the push notification and check the response
		  response = PushyAPI.sendPushNotification(data, to, options)
		  logger.info("Pushy API response: {}".format(response))

		else:
		  logging.info("Node {} does not exist".format(user_node_id))

	if message:
		logging.info("Sent a push notificiation to {}".format(user_node_id))
		return True
	
	return False


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

	response = {
		"error": ""
	}

	if not rds:
		response["error"] = "Could not connect to redis cache."
		return json.dumps(response)

	valid_user = True

	if valid_user:
		result = send_push(event, rds)

		if not result: 
			response["error"] = "Could not send the push notification."
	else:
		response["error"] = "Invalid request."

	return json.dumps(response)


def run():
	test_event = {
		"action": "send_friend_invite",
		"relation_id": "",
		"friend_id": "",
		"user_id": "",
	}
	
	test_context = {
	}

	response = lambda_handler(test_event, test_context)
	print(response)

	

if __name__ == '__main__':run()