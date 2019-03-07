const plaid = require('plaid');
const bodyParser = require('body-parser')

const PLAID_CLIENT_ID = '5be83d9fd4530d0014d4a287';
const PLAID_PUBLIC_KEY = '5a051f20478de47fc55b0e33ffa325';
const PLAID_SECRET = '5a051f20478de47fc55b0e33ffa325';
const public_token = 'public-development-e19bf79a-7af2-4538-abd8-3c8ab322dfc4';

const plaidClient = new plaid.Client(
  PLAID_CLIENT_ID,
  PLAID_SECRET, 
  PLAID_PUBLIC_KEY, 
  plaid.environments.development, 
  { version: '2018-05-22' }
);

const express = require('express')
const app = express()
const port = 3000

app.use(bodyParser.json({ type: 'application/json' }))
const urlencodedParser = bodyParser.urlencoded({ extended: false })


app.post('/', async function(req, res) {
  let result = await tokenExchange();

  if (result) {
    res.send(result);
  }
  res.send('');
});

app.get('/transactions', async function(req, res) {
  let result = await getTransactions();

  if (result) {
    res.status(200).json(result);
  }
});

async function tokenExchange() {

  const token = 'public-development-02379bba-bd27-4ea3-9621-c06c95a1ed08';

  console.log('attempting to transfer public token to session token....', token);
  let result = await plaidClient.exchangePublicToken(token);

  const accessToken = result.access_token;

  if (accessToken) {
    console.log('accessToken....', accessToken);
    console.log('getting transactions for account....');
    getTransactions(accessToken);
    return accessToken;
  }
  console.log('unable to get accessToken....', accessToken);
  return;
}

async function getTransactions() {

  const accessToken = 'access-development-a6df1be3-afc9-42ca-af8f-95e508009761';

  console.log('attempting to get transactions for account....', accessToken);

  let result = await plaidClient.getTransactions(
    accessToken, '2018-01-01', '2018-02-01', {
    count: 100,
    offset: 0,
  });

  if (result) {
    console.log('got transactions....', result);
    return result;
  }
  return; 
}

async function getIncome(accessToken) {

  console.log('attempting to get income....', accessToken);

  let result = await plaidClient.getIncome(accessToken);

  try {
    console.log(result, 'got result from get income');
    getIdentity(accessToken);
    return result, true;
    } catch (error) {
    console.log(error, 'unable to get result from get income');
  }
}

 async function identity(accessToken) {

  console.log('attempting to get identity....', accessToken);

  let result = await plaidClient.getIdentity(accessToken);

  try {
    console.log(result, 'got result from get identity');
    getIdentity(accessToken);
    return result, true;
    } catch (error) {
    console.log(error, 'unable to get result from get identity');
  }
}

// getTransactions();
// tokenExchange();

app.listen(port, () => console.log(`Example app listening on port ${port}!`))