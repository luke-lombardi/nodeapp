## Smartshare API

This directory contains all lambda function endpoint code used by the Smartshare app, as well as other general purpose APIs that are not used directly by the app. To get started developing locally, run the following commands (all from `./`):

1. Create a virtual environment: `virtualenv -p python3.6 venv`
2. Activate it: `source venv/bin/activate`
3. Install requirements: `pip install -r requirements`
4. Run an endpoint locally: `python -m endpoints.getAllNodes.lambda_function`

---

### Build and deploy

1. To build: `./build endpointName`
2. To deploy: `./deploy SMARTSHARE_API endpointName`

**Note**: this will deploy the endpoint to the DEV lambda alias, to deploy to production, you must manually publish a new version in the AWS Console. Then you can point the PROD alias to that new version. This could also be automated but for safety remains a manual step.
