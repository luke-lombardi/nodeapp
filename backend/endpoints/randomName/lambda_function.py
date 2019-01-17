'''
    endpoint: /fyb/randomName
    method: GET
    format: application/json

    description:

'''

import redis
import json
import logging
import os
import datetime
import hashlib
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


ADJECTIVE_LIST = 'adjectives.txt'
NOUN_LIST = 'nouns.txt'
NUMBER_RANGE = [100, 999]


def generate_name():
  adjectives = []

  with open(ADJECTIVE_LIST, 'r') as f_in:
    adjectives = [a.strip().capitalize() for a in f_in.readlines() if a.strip() != '']

  with open(NOUN_LIST, 'r') as f_in:
    nouns = [n.strip().lower().capitalize() for n in f_in.readlines() if n.strip() != '']
  
  random_adjective = adjectives[ randint(0, len(adjectives)-1) ]
  random_noun = nouns[ randint(0, len(nouns)-1) ]
  random_number = randint(NUMBER_RANGE[0], NUMBER_RANGE[1])

  random_name = "{}{}{}".format(random_adjective, random_noun, random_number)
  
  return random_name


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

    random_name = {
      "username": generate_name()
    }


    return random_name


def run():
    test_event = {
    }
    
    test_context = {

    }

    response = lambda_handler(test_event, test_context)
    print(response)

    
    

if __name__ == '__main__':run()