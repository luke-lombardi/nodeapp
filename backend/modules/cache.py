import redis
import logging
import os

local_env = os.environ.get('LOCAL_ENV', 0)

if local_env:
  from config_LOCAL import Config as ConfigDev
else:
  from config_DEV import Config as ConfigDev
  from config_PROD import Config as ConfigProd

# Initialize logger
logger = logging.getLogger()
logger.setLevel(logging.INFO)


def is_cache_connected(rds):
    try:
        response = rds.client_list()
    except redis.ConnectionError:
        return False
    return True


def connect_to_cache(stage):
    Config = None
    if stage == 'PROD':
        logging.info('Deployment Stage: PROD')
        Config = ConfigProd
    else:
        logging.info('Deployment Stage: DEV')
        Config = ConfigDev

    rds = redis.StrictRedis(host=Config.hostname, password=Config.password, port=int(Config.port), db=0, socket_connect_timeout=5)

    connected = is_cache_connected(rds)
    if connected:
        logging.info('Connection successful.')
        return rds
    else:
        logging.info('Could not connect to redis cache.')
        return None