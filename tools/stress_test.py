'''
    endpoint: /fyb/createNode
    method: POST
    format: application/json

    description:
        Adds a new node to the database and returns a unique node_id.
        This node_id can then be added to the 'tracked' node list.
'''
import twitter
import foursquare
import praw
import redis
import json
import logging
import os
import random 
from random import randint
import time

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

LAT_RANGE = [40.700486, 40.7115538]
LONG_RANGE = [-73.9443873, -73.970724]

MANHATTAN_LAT_RANGE = [40.7057005, 40.8033714]
MANHATTAN_LONG_RANGE = [-74.0135251, -73.9383381]

DENVER_LAT_RANGE = [39.791177, 39.602155]
DENVER_LONG_RANGE = [-105.055858, -104.9979502]

twitter_key = 'Xk4VJpVivXWqF8KHlVGq8zTa6'
twitter_secret = 'pUS6sddtHNq19cJbBXv2Itb9o4LNS9mjHScqnW6NWMHJV7sqkY'
twitter_url = 'https://api.twitter.com/1.1/trends/closest.json?lat=37.781157&long=-122.400612831116'
access_token = '874802212316250112-VZCfbrrzZTm9d9rUg4ccdr1ycxC2XTX'
access_token_secret = 'klgJJD5Aa74Y2I9yGtLsGDRnPb1CM8QerBPOT1uDpwMG9'

def get_foursquare():

  spots = []

  client = foursquare.Foursquare(client_id='K14FVC2J10UYPEHTE2JL1PHXNRX3CCPXSB0KUMCYOSNQUY5Y', 
                                client_secret='STMMKGZ3JNJEOTTUPQBQBUYBQF0V1M1RUZFTKN4EIUP2UNUT')

  params = { 'near': 'denver, co' }
  trending = client.venues.explore(params=params)
  for i in trending['groups']:
    theList = i['items']
    for i in theList:
      place = i['venue']['id']
      name = i['venue']['name']
      tip = client.venues.tips(place)
      popular = {
        'tip': tip['tips']['items'][0]['text'],
        'name': name,
        'lat': i['venue']['location']['lat'],
        'lng': i['venue']['location']['lng'],
      }
      spots.append(popular)
      venue = random.choice(spots)
  
    return venue
    
    # popular = {
    #   'name': i['name'],
    #   'lat': i['location']['lat'],
    #   'lng': i['location']['lng']
    # }
  #  print(popular)

  # # kingston hall
  # params = {
  #   'VENUE_ID': '4fe50b08e4b08674c9dd2bd4'
  # }

  # venues = client.venues.similar('4fe50b08e4b08674c9dd2bd4')
  # for i in venues['similarVenues']['items']:
  #   tip = client.venues.tips(i['id'])
  #   popular = {
  #     'tip': tip['tips']['items'][0]['text'],
  #     'name': i['name'],
  #     'lat': i['location']['lat'],
  #     'lng': i['location']['lng']
  #   }
  #   spots.append(popular)
  # venue = random.choice(spots)
  # print(popular['tip'])

def get_comments():

  reddit = praw.Reddit(client_id='1mWKUky4qI_6Iw',
                      client_secret='QxluFw2oi-_7904WQik6gYW1ewQ',
                      password='7354839',
                      user_agent='testscript by /u/fakebot3',
                      username='velobro')

  submission = reddit.submission('7rxyh');
  # reddit.front.controversial(limit=256)
  for i in submission.comments:
    try:
      print(i.body + '\n')
    except:
      submission.comments.replace_more()
      return

def get_reddit_denver():

  submissions = []
  topics = ['denver', 'oneliners', 'SandersForPresident', 'debt']
  
  reddit = praw.Reddit(client_id='1mWKUky4qI_6Iw',
                      client_secret='QxluFw2oi-_7904WQik6gYW1ewQ',
                      password='7354839',
                      user_agent='testscript by /u/fakebot3',
                      username='velobro')

  # reddit.front.controversial(limit=256)
  for submission in reddit.subreddit(random.choice(topics)).controversial('year'):
    submissions.append(submission.title.replace('Reddit', 'sudo').replace('reddit', 'sudo'))
  print(random.choice(submissions))
  return random.choice(submissions)

def get_reddit():

  submissions = []
  topics = ['ASKNYC', 'oneliners', 'Williamsburg', 'Yankees', 'Seduction', 'SandersForPresident']
  
  reddit = praw.Reddit(client_id='1mWKUky4qI_6Iw',
                      client_secret='QxluFw2oi-_7904WQik6gYW1ewQ',
                      password='7354839',
                      user_agent='testscript by /u/fakebot3',
                      username='velobro')

  # reddit.front.controversial(limit=256)
  for submission in reddit.subreddit(random.choice(topics)).controversial('year'):
    submissions.append(submission.title.replace('Reddit', 'sudo').replace('reddit', 'sudo'))
  print(random.choice(submissions))
  return random.choice(submissions)

def get_tweets():

  api = twitter.Api(consumer_key=twitter_key,
                  consumer_secret=twitter_secret,
                  access_token_key=access_token,
                  access_token_secret=access_token_secret)

  # trends = api.GetTrendsCurrent()
  # favorites = api.GetHomeTimeline()
  statuses = api.GetSearch(term="denver",result_type='popular')

  # statuses = api.GetFavorites(user_id=4330757717)
  # print(statuses)
  for status in statuses:
    popular = status.text.replace('&amp', '').replace(';', '')
    print(popular + '\n')
    return popular

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
        # ttl = ttl * 3600
      ttl = 3600 * randint(1, 4)
    else:
        ttl = DEFAULT_NODE_TTL

    rds.setex(name=key_name, value=json.dumps(node_data), time=int(ttl))

    return key_name

def generate_random_nodes_denver(n=1):
  nodes = []

  for i in range(n):
    random_lat = random.uniform(DENVER_LAT_RANGE[0], DENVER_LAT_RANGE[1])
    random_long = random.uniform(DENVER_LONG_RANGE[0], DENVER_LONG_RANGE[1])
    random_node_id = str(uuid4())
    random_node_title = get_foursquare()

    # random_node_data = {
    #   'topic': random_node_title,
    #   'lat': str(random_lat),
    #   'lng': str(random_long),
    #   'private': False,
    #   'type': 'place',
    #   'ttl': 3600
    # }

    random_node_data = {
      'id': random_node_id,
      'topic': random_node_title['tip'].replace('/', ' '),
      'lat': str(random_node_title['lat']),
      'lng': str(random_node_title['lng']),
      'private': False,
      'type': 'place',
      'ttl': 3600
    }

    print(random_lat)
    print(random_long)

    nodes.append(random_node_data)

  return nodes

def generate_random_nodes_denver_reddit(n=1):
  nodes = []

  for i in range(n):
    random_lat = random.uniform(DENVER_LAT_RANGE[0], DENVER_LAT_RANGE[1])
    random_long = random.uniform(DENVER_LONG_RANGE[0], DENVER_LONG_RANGE[1])
    random_node_id = str(uuid4())
    random_node_title = get_reddit_denver()

    random_node_data = {
      'topic': random_node_title,
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


def generate_random_nodes(n=1):
  nodes = []

  for i in range(n):
    random_lat = random.uniform(MANHATTAN_LAT_RANGE[0], MANHATTAN_LAT_RANGE[1])
    random_long = random.uniform(MANHATTAN_LONG_RANGE[0], MANHATTAN_LONG_RANGE[1])
    random_node_id = str(uuid4())
    random_node_title = get_reddit()

    random_node_data = {
      'topic': random_node_title,
      'lat': str(random_lat),
      'lng': str(random_long),
      'private': False,
      'type': 'place',
      'ttl': 3600
    }

    # random_node_data = {
    #   'topic': random_node_title['tip'],
    #   'lat': random_node_title['lat'],
    #   'lng': random_node_title['lng'],
    #   'private': False,
    #   'type': 'place',
    #   'ttl': 3600
    # }

    print(random_lat)
    print(random_long)

    nodes.append(random_node_data)

  return nodes

def generate(event):
    rds = cache.connect_to_cache('DEV')

    if not rds:
        return
    
    generated_nodes = generate_random_nodes(n=1)

    for node in generated_nodes:
      node_id = node['id']
      key_name = insert_node(rds, node_id, node)
      print(key_name)
    
    return len(generated_nodes)

def generate_denver(event):
    rds = cache.connect_to_cache('DEV')

    if not rds:
        return
    
    generated_nodes = generate_random_nodes_denver(n=1)

    for node in generated_nodes:
      node_id = node['id']
      key_name = insert_node(rds, node_id, node)
      print(key_name)
    
    return len(generated_nodes)

def generate_denver_reddit(event):
    rds = cache.connect_to_cache('DEV')

    if not rds:
        return
    
    generated_nodes = generate_random_nodes_denver_reddit(n=1)

    for node in generated_nodes:
      node_id = node['id']
      key_name = insert_node(rds, node_id, node)
      print(key_name)
    
    return len(generated_nodes)

def run():

  running = True

  test_event = {
  }

  while running:
    response = generate(test_event)
    denver_response = generate_denver(test_event)
    denver_reddit_response = generate_denver_reddit(test_event)
    print("Inserted {} new nodes.".format(response))
    time.sleep(720)

  

if __name__ == '__main__': run()
