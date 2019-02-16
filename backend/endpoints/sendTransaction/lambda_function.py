'''
    endpoint: /sendTransaction
    method: GET
    format: application/json

    description:
      sends eth to another user, currency in payload should be in USD for now
        
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


def get_current_exchange_rate():
  r = requests.get('https://api.coinmarketcap.com/v1/ticker/ethereum')
  if r.status_code == 200:
    return r.json()[0]
  else:
    return None

# lambda_client = boto3.client('lambda', 
#                         aws_access_key_id='AKIAJTWJKPPNEIBU4BSQ', 
#                         aws_secret_access_key='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', 
#                         region_name='us-east-1')

def send_funds(transaction_data):
  err_msg = ""

  w3 = Web3(HTTPProvider(PROVIDER))
  if not w3.isConnected():
    logger.info("Could not connect through provider: {}".format(PROVIDER))
    err_msg = "no_connection"
    return None

  logger.info("Connected. Creating wallet from private key.")
  
  # How much $ to be sent in USD
  usd_amt = transaction_data.get('amt', None)
  if not usd_amt:
    logger.info("Invalid amount specified: {}".format(usd_amt))
    err_msg = "invalid_amt"
    return None
  
  # Get current exchange rate
  exchange_rate = get_current_exchange_rate()
  eth_amt = float(usd_amt) / float(exchange_rate['price_usd'])
  wei_amt = Web3.toWei(eth_amt, 'ether')
  gas_price = w3.eth.gasPrice

  logger.info("Attempting to send {} USD, which is {} ETH and {} Wei".format(usd_amt, eth_amt, wei_amt))
  logger.info("Gas price is currently {}".format(gas_price))

  rcpt_address = transaction_data.get('rcpt_address', "")
  if not Web3.isAddress(rcpt_address):
    logger.info("Invalid recipient address specified, exiting.")
    err_msg = "invalid_rcpt_addr"
    return None
  
  private_key = transaction_data.get('private_key', '')

  sender_acct = Account.privateKeyToAccount(private_key)
  sender_nonce = w3.eth.getTransactionCount(sender_acct.address)

  logger.info("Sending transaction from address: {}".format(sender_acct.address))
  logger.info("Sender nonce: {}".format(sender_nonce))

  # logger.info(vars(sender_acct))
  transaction = {
          'to': rcpt_address,
          'value': wei_amt,
          'gasPrice': gas_price,
          'nonce': sender_nonce,
          'chainId': CHAIN_ID
  }
  
  estimated_gas = w3.eth.estimateGas(transaction)
  logger.info("Estimated gas cost for transaction: {}".format(estimated_gas))

  # Add estimated gas to transaction dict
  transaction['gas'] = estimated_gas

  # Sign transaction
  signed = sender_acct.signTransaction(transaction)
  tx_hash = None

  attempt = 0
  # Attempt to send the transaction
  while not tx_hash and attempt <= 3:
      try:
          nonce = w3.eth.getTransactionCount(sender_acct.address)
          transaction['nonce'] = nonce
          signed = sender_acct.signTransaction(transaction)
          tx_hash = w3.eth.sendRawTransaction(signed.rawTransaction)
      except Exception as e:
          logger.info('Account busy... trying again in 10 seconds: ' + str(e))
          time.sleep(10.0)
          attempt += 1

  if tx_hash:
    tx_hash = w3.toHex(tx_hash)
    logger.info("Sent transaction, hash is: {}".format(tx_hash))
  else:
    err_msg = "acct_busy"

  return err_msg, tx_hash


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

    err_msg, tx_hash = send_funds(event)

    response = {
      "tx_hash": tx_hash,
      "timestamp": int(time.time() * 1000),
      "error": err_msg,
    }

    return response


def run():
    test_event = {
      'private_key': '0xb0919bab4983f14d18a0e62400102ecfc982de0bf5bf9b50d89edd38ba5a0a7f',
      'rcpt_address': '0x14ad1E22AeFc9A3233d8EeebCdF4E318029f9B4B',
      'amt': 10.00,
    }
    
    test_context = {
    }
    
    response = lambda_handler(test_event, test_context)
    print(response)

    
    

if __name__ == '__main__':run()