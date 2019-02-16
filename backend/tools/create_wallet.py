import time

import web3
from web3 import Web3, HTTPProvider
from web3.middleware import geth_poa_middleware
from web3.middleware import pythonic_middleware

PROVIDER = 'https://rinkeby.infura.io/v3/316e949b3e404eb0bc8ad669e4472789'

def get_new_wallet():
  w3 = Web3(HTTPProvider(PROVIDER))
  new_account = w3.eth.account.create() # linter complains for some reason, weird namespace issue
  wallet_address = new_account._address
  private_key = w3.toHex(new_account._privateKey)
  return (wallet_address, private_key)


def export_private_key(wallet_address, private_key):
  current_timestamp = str(int(time.time()))
  with open("wallet_{}.txt".format(current_timestamp), 'w') as f_out:
    f_out.write(wallet_address + '\n')
    f_out.write(private_key + '\n')

def run():
  wallet_address, private_key = get_new_wallet()
  export_private_key(wallet_address.strip(), private_key.strip())
  print("Generated wallet {}, private key exported to wallet.txt".format(wallet_address))


if __name__ == '__main__': run()