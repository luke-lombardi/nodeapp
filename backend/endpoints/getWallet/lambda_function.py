'''
    endpoint: /getTransactions
    method: GET
    format: application/json

    description:
      get tracked transactions / tx receipts for redux store
'''

import redis
import json
import logging
import os
# import boto3
import time
import requests

import web3
from web3 import Web3, HTTPProvider, Account
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


# TODO: replace these with environmental variables
PROVIDER = 'https://rinkeby.infura.io/v3/316e949b3e404eb0bc8ad669e4472789'
CHAIN_ID = 4

# lambda_client = boto3.client('lambda', 
#                         aws_access_key_id='AKIAJTWJKPPNEIBU4BSQ', 
#                         aws_secret_access_key='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', 
#                         region_name='us-east-1')

def get_current_exchange_rate():
  r = requests.get('https://api.coinmarketcap.com/v1/ticker/ethereum')
  if r.status_code == 200:
    return r.json()[0]
  else:
    return None


def get_wallet(account_data):
  err_msg = ""
  w3 = Web3(HTTPProvider(PROVIDER))
  if not w3.isConnected():
    print("Could not connect through provider: {}".format(PROVIDER))
    err_msg = "no_connection"
    return err_msg, {}

  private_key = account_data.get('private_key', "")

  try:
    sender_acct = Account.privateKeyToAccount(private_key)
  except:
    err_msg = "invalid_private_key"
    return err_msg, {}

  if not Web3.isAddress(sender_acct.address):
    print("Invalid private key specified, exiting.")
    err_msg = "invalid_private_key"
    return err_msg, {}

  sender_nonce = w3.eth.getTransactionCount(sender_acct.address)

  print("Requesting user address: {}".format(sender_acct.address))
  print("Requesting user nonce: {}".format(sender_nonce))

  exchange_rate = get_current_exchange_rate()

  sender_balance_wei = w3.eth.getBalance(sender_acct.address)
  eth_amt = float(Web3.fromWei(sender_balance_wei, 'ether'))
  usd_amt = float(exchange_rate['price_usd']) * float(eth_amt)

  account_details = {
    'address': sender_acct.address,
    'balance_usd': usd_amt,
    'balance_eth': eth_amt,
    'nonce': sender_nonce,
  }

  return err_msg, account_details

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
    err_msg, account_details = get_wallet(event)

    response = {
      "timestamp": int(time.time() * 1000),
      "address": account_details.get('address', None),
      "balance_usd": account_details.get('balance_usd', None),
      "balance_eth": account_details.get('balance_eth', None),
      "nonce": account_details.get('nonce', None),
      "error": err_msg,
    }

    return response


def run():
    test_event = {
      'private_key': '0xb0919bab4983f14d18a0e62400102ecfc982de0bf5bf9b50d89edd38ba5a0a7f',
    }
    
    test_context = {
    }
    
    response = lambda_handler(test_event, test_context)
    logger.info(response)

    
    

if __name__ == '__main__':run()