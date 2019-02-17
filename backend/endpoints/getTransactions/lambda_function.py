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


def get_transactions(transactions_data):
  err_msg = ""
  w3 = Web3(HTTPProvider(PROVIDER))
  if not w3.isConnected():
    logger.info("Could not connect through provider: {}".format(PROVIDER))
    err_msg = "no_connection"
    return err_msg, None

  private_key = transactions_data.get('private_key', "")
  sender_acct = Account.privateKeyToAccount(private_key)

  if not Web3.isAddress(sender_acct.address):
    logger.info("Invalid private key specified, exiting.")
    err_msg = "invalid_private_key"
    return err_msg, None

  sender_nonce = w3.eth.getTransactionCount(sender_acct.address)
  if sender_nonce  == 0:
    err_msg = "no_tx"
    return err_msg, None

  logger.info("Requesting user address: {}".format(sender_acct.address))
  logger.info("Requesting user nonce: {}".format(sender_nonce))

  transactions_to_get = transactions_data.get('transactions', [])

  transactions = {}
  exchange_rate = get_current_exchange_rate()

  for tx_hash in transactions_to_get:
    try:
      logger.info("Attempting to get tx: {}".format(tx_hash))

      # Get the tx object as well as the status
      current_tx = w3.eth.getTransaction(tx_hash)
      current_tx_receipt = w3.eth.getTransactionReceipt(tx_hash)

      eth_amt = Web3.fromWei(current_tx['value'] - current_tx_receipt['gasUsed'], 'ether')
      usd_amt = float(exchange_rate['price_usd']) * float(eth_amt)

      gas_price = w3.eth.gasPrice
      transactions[tx_hash] = {
        'from': current_tx['from'],
        'to': current_tx['to'],
        'amt': usd_amt,
        'status': current_tx_receipt.status
      }
      
      logger.info("Current tx status: {}".format(current_tx_receipt.status))
    except:
      continue

  logger.info(transactions)

  return err_msg, transactions


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

    err_msg, transactions = get_transactions(event)

    response = {
      "transactions": transactions,
      "timestamp": int(time.time() * 1000),
      "error": err_msg,
    }

    return response


def run():
    test_event = {
      'private_key': '0xb0919bab4983f14d18a0e62400102ecfc982de0bf5bf9b50d89edd38ba5a0a7f',
      'transactions': [
      '0x3eadc7c1353ef1939b3509649bf2c6187a92aa2a6b1aca1f8806706a873226ba', 
      '0xd0d1e50488677c8162cb1c521078deb919d49daaf2229a9e4cb26aa9ab2d4f6e',
      ],
    }
    
    test_context = {
    }
    
    response = lambda_handler(test_event, test_context)
    logger.info(response)

    
    

if __name__ == '__main__':run()