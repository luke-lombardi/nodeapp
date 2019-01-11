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

# def get_user_info(db, sub):
#     cursor = db.cursor()
#     try:
#       cursor.execute('SELECT id, username, sub, phone_number FROM users WHERE sub=%s;',(sub,))
#     except Exception as e:
#       logger.info(str(e))
#       cursor.close()
#       return []

#     user_info = cursor.fetchone()

#     cursor.close()
    
#     if user_info:
#       return user_info
#     else:
#       return []


def create_lead(db, lead_data):
    cursor = db.cursor()
    try:
      cursor.execute('INSERT INTO leads(name, title, department, email, phone, notes, probability, product, mrr, status) VALUES(%s,%s,%s,%s,%s,%s,%s,%s,%s,%s);',
      (lead_data['name'], lead_data['title'], lead_data['department'], lead_data['email'], lead_data['phone'], \
      lead_data['notes'], lead_data['probability'], lead_data['product'], lead_data['mrr'], lead_data['status'] ))
    except Exception as e:
      logger.info(str(e))
      cursor.close()
      return 0

    db.commit()

    lead_id = cursor.lastrowid
    cursor.close()

    return lead_id
    

def lambda_handler(event, context):
  response = {
    "statusCode": 200,
    "headers": {},
    "body": None,
    "isBase64Encoded": False
  }

  print(event)

  try:
    request_body = json.loads(event['body'])
  except:
    request_body = {}

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
  
  # user_info = None
  # found_user = get_user_info(db, sub=sub)
  # if found_user:
  #     user_info = {
  #       'id': found_user['id'],
  #       'username': found_user['username'],
  #       'phone_number': found_user['phone_number'],
  #       'sub': found_user['sub'],
  #     }
  
  # This is the actual response body
  body = {
    'error_msg': '',
    'lead_id': 0,
  }

  lead_data = {}
  # if user_info:
  lead_data['name'] = request_body.get('name', '')
  lead_data['title'] = request_body.get('title', '')
  lead_data['department'] = request_body.get('department', '') 
  lead_data['email'] = request_body.get('email', '')
  lead_data['phone'] = request_body.get('phone', '')
  lead_data['notes'] = request_body.get('notes', '')
  lead_data['probability'] = float(request_body.get('probability', 0))
  lead_data['product'] = request_body.get('product', '')
  lead_data['mrr'] = float(request_body.get('mrr', 0.0))
  lead_data['status'] = request_body.get('status', '')

  lead_id = create_lead(db, lead_data)
  
  if lead_id == 0:
    body['error_msg'] = 'Error inserting new lead.'
  else:
    body['lead_id'] = lead_id
  
  response['body'] = json.dumps(body)

  db.close()

  return response

# Entry point for testing
if __name__ == '__main__':
  with open('test_event.json', 'r') as f_in:
    test_event = json.load(f_in)

  response = lambda_handler(test_event, None)
  logger.info(response)