import subprocess
import re
import sys
import json
from os.path import expanduser

env = {}

def load_env():
  home = expanduser("~")
  with open(home + '/ss_config.json', 'r') as f_in:
    sa_creds = json.load(f_in)
  return sa_creds


def generate_config(CONFIG_PREFIX, DEPLOYMENT_STAGE='DEV'):
  global env
  sa_creds = load_env()
  with open('config_' + DEPLOYMENT_STAGE + '.py', 'w') as f_out:

    f_out.write('class Config(object):\n')
    configuration_vars = sa_creds.get(CONFIG_PREFIX,'')
    if configuration_vars:
      print('Found configuration variables for prefix: ' + CONFIG_PREFIX)
      stage_vars = configuration_vars.get(DEPLOYMENT_STAGE, {})
      for name, value in stage_vars.items():
        f_out.write('\t' + name + ' = \"' + value + '\"\n')




if __name__ == '__main__':
  load_env()
  generate_config(sys.argv[1], DEPLOYMENT_STAGE=sys.argv[2])