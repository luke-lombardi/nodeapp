import json
import requests
import os

class PushyAPI:

    @staticmethod
    def sendPushNotification(data, to, options):
        # Insert your Pushy Secret API Key here
        apiKey = 'ef720829e41cb53eeeed22cae330693744341174d4cec68b05b6281efd5d4cc7'
        apiKey = 'cd45fded5aaa53d401bdce251a2dbeed89ffc9ce952fec8900c615da6709ffe5'


        # Default post data to provided options or empty object
        postData = options or {}
        
        # Set notification payload and recipients
        postData['to'] = to
        postData['data'] = data

        headers = {'Content-Type':'application/json' }

        # Set URL to Send Notifications API endpoint
        data = json.dumps(postData)
        response = None

        try:
           response = requests.post('https://api.pushy.me/push?api_key=' + apiKey, data=data, headers=headers)
        except Exception as e:
           # Print response errors
           print(e)
          
        return response
