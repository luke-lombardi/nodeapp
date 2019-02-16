import time
import requests
import os
import logging

import web3
from web3 import Web3, HTTPProvider, Account
from web3.middleware import geth_poa_middleware
from web3.middleware import pythonic_middleware

# logger = logging.getLogger()
# logger.setLevel(logging.DEBUG)

PROVIDER = 'https://rinkeby.infura.io/v3/316e949b3e404eb0bc8ad669e4472789'
CHAIN_ID = 4


def get_current_exchange_rate():
  r = requests.get('https://api.coinmarketcap.com/v1/ticker/ethereum')
  if r.status_code == 200:
    return r.json()[0]
  else:
    return None


def get_account(account_data):
  err_msg = ""
  w3 = Web3(HTTPProvider(PROVIDER))
  if not w3.isConnected():
    print("Could not connect through provider: {}".format(PROVIDER))
    err_msg = "no_connection"
    return err_msg, None

  private_key = account_data.get('private_key', "")
  sender_acct = Account.privateKeyToAccount(private_key)

  if not Web3.isAddress(sender_acct.address):
    print("Invalid private key specified, exiting.")
    err_msg = "invalid_private_key"
    return err_msg, None

  sender_nonce = w3.eth.getTransactionCount(sender_acct.address)
  if sender_nonce  == 0:
    err_msg = "no_tx"
    return err_msg, None

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


def run():
  test_event = {
    'private_key': '0xb0919bab4983f14d18a0e62400102ecfc982de0bf5bf9b50d89edd38ba5a0a7f',
  }
  
  account_details = get_account(test_event)
  print(account_details)
 
if __name__ == '__main__': run()