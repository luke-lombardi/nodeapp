import pymysql
import json
import logging
import os

local_env = os.environ.get('LOCAL_ENV', 0)

if local_env:
  from config_LOCAL import Config as ConfigDev
else:
  from config_DEV import Config as ConfigDev
  from config_PROD import Config as ConfigProd

logger = logging.getLogger()
logging.basicConfig()
logger.setLevel(logging.INFO)


def get_mysql_db(alias):
    if alias == 'DEV':
      logger.info('Deployment stage: DEV')
      Config = ConfigDev
    elif alias == 'PROD':
      logger.info('Deployment stage: PROD')
      Config = ConfigProd

    try:
        conn = pymysql.connect(host=Config.hostname,
                             user=Config.username,
                             password=Config.password,
                             db=Config.database,
                             charset=Config.charset,
                             cursorclass=pymysql.cursors.DictCursor)
    except Exception as e:
        logger.info("Error connecting to database: " + str(e))
        return None

    return conn


def get_leads(db):
    cursor = db.cursor()
    try:
      cursor.execute('SELECT id, name, title, department, email, notes, phone, probability, mrr, status FROM leads;',())
    except Exception as e:
      logger.info(str(e))
      cursor.close()
      return []

    leads = cursor.fetchall()

    cursor.close()
    
    if leads:
      return leads
    else:
      return []


def lambda_handler(event, context):
  response = {
    "statusCode": 200,
    "headers": {},
    "body": None,
    "isBase64Encoded": False
  }

  db = None
  # if we are running locally, use the DEV config file
  if not context:
    db = get_mysql_db('DEV')
  else:
    # choose which config file to use based on the invoked function ARN
    context_vars = vars(context)
    alias = context_vars['invoked_function_arn'].split(':')[-1]

    if alias == 'PROD':
      db = get_mysql_db('PROD')
    else:
      db = get_mysql_db('DEV')
    
  if not db:
    logger.info("No database connection, returning...")
    return response

  # get subscriber from authorizer
  # sub = event['requestContext']['authorizer']['claims']['sub']

  leads = get_leads(db)
  if leads:
    response['body'] = json.dumps(leads)

  db.close()

  return response


# Entry point for testing
if __name__ == '__main__':
  with open('test_event.json', 'r') as f_in:
    test_event = json.load(f_in)

  response = lambda_handler(test_event, None)
  logger.info(response)