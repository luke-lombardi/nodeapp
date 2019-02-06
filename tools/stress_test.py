'''
    endpoint: /fyb/createNode
    method: POST
    format: application/json

    description:
        Adds a new node to the database and returns a unique node_id.
        This node_id can then be added to the 'tracked' node list.
'''

import redis
import json
import logging
import os

from uuid import uuid4
import random
import cache

logger = logging.getLogger()
logger.setLevel(logging.INFO)

local_env = os.environ.get('LOCAL_ENV', 0)

if local_env:
  from config_LOCAL import Config as ConfigDev
else:
  from config_DEV import Config as ConfigDev
  from config_PROD import Config as ConfigProd

import random

DEFAULT_NODE_TTL = 3600 * 24

LAT_RANGE = [40.467099, 40.065921]
LONG_RANGE = [-74.598518, -73.378937]

def get_new_uuid(rds):
    node_id = uuid4()
    while rds.exists(node_id):
        node_id = uuid4()
    return node_id


def insert_node(rds, node_id, node_data):
    private = node_data.get("private", True)
    prefix = "private:"

    if not private:
        prefix = "public:"
    
    key_name = prefix+str(node_id)

    ttl = node_data.get("ttl", None)
    if ttl:
        ttl = ttl * 3600
    else:
        ttl = DEFAULT_NODE_TTL

    rds.setex(name=key_name, value=json.dumps(node_data), time=int(ttl))

    return key_name


def generate_random_nodes(n=1):
  nodes = []

  for i in range(n):
    random_lat = random.uniform(LAT_RANGE[0], LAT_RANGE[1])
    random_long = random.uniform(LONG_RANGE[0], LONG_RANGE[1])
    random_node_id = str(uuid4())

    random_node_data = {
      'topic': random_node_id,
      'lat': str(random_lat),
      'lng': str(random_long),
      'private': False,
      'type': 'place',
      'ttl': 3600
    }

    print(random_lat)
    print(random_long)

    nodes.append(random_node_data)

  return nodes


def generate(event):
    rds = cache.connect_to_cache('DEV')

    if not rds:
        return
    
    generated_nodes = generate_random_nodes(n=100)

    for node in generated_nodes:
      node_id = node['topic']
      key_name = insert_node(rds, node_id, node)
      print(key_name)
    
    return len(generated_nodes)


def run():
    test_event = {
    }

    response = generate(test_event)
    print("Inserted {} new nodes.".format(response))

    
    

if __name__ == '__main__':run()