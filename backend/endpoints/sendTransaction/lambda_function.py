'''
    endpoint: /postNode
    method: GET
    format: application/json

    description:
        
'''

import redis
import json
import logging
import os
import boto3

import web3
from web3 import Web3, HTTPProvider
from web3.middleware import geth_poa_middleware
from web3.middleware import pythonic_middleware
from modules import cache

logger = logging.getLogger()
logger.setLevel(logging.INFO)

local_env = os.environ.get('LOCAL_ENV', 0)

if local_env:
  from config_LOCAL import Config as ConfigDev
else:
  from config_DEV import Config as ConfigDev
  from config_PROD import Config as ConfigProd


DEFAULT_NODE_TTL = 3600
PROVIDER = 'https://rinkeby.infura.io/v3/316e949b3e404eb0bc8ad669e4472789'


lambda_client = boto3.client('lambda', 
                        aws_access_key_id='AKIAJTWJKPPNEIBU4BSQ', 
                        aws_secret_access_key='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', 
                        region_name='us-east-1')


def get_new_wallet():
    w3 = Web3(HTTPProvider(PROVIDER))
    new_account = w3.eth.account.create() # linter complains for some reason, weird namespace issue
    wallet_address = new_account._address
    private_key = w3.toHex(new_account._privateKey)
    return (wallet_address, private_key)


def lambda_handler(event, context):
    rds = None
  
    # if we are running locally, use the DEV config file
    if not context:
        rds = cache.connect_to_cache('DEV')
    else:
        # choose which config file to use based on the invoked function ARN
        context_vars = vars(context)
        alias = context_vars['invoked_function_arn'].split(':')[-1]

        if alias == 'PROD':
            rds = cache.connect_to_cache('PROD')
        else:
            rds = cache.connect_to_cache('DEV')

    if not rds:
        return

    logging.info('Event payload: %s', event)


    print(get_new_wallet())
    

    return None


def run():
    test_event = {
        "node_id": '12345',
        "node_data": {
            "title": "demos for sale",
            "lat": 43.13232,
            "lng": 43.333,
            "public": False,
            "type": "static",
        }
    }
    
    test_context = {

    }
    
    print(get_new_wallet())
    response = lambda_handler(test_event, test_context)
    print(response)

    
    

if __name__ == '__main__':run()