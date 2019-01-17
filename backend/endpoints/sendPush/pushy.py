import json
import urllib2

class PushyAPI:

    @staticmethod
    def sendPushNotification(data, to, options):
        # Insert your Pushy Secret API Key here
        apiKey = 'ef720829e41cb53eeeed22cae330693744341174d4cec68b05b6281efd5d4cc7';

        # Default post data to provided options or empty object
        postData = options or {}
        
        # Set notification payload and recipients
        postData['to'] = to
        postData['data'] = data

        # Set URL to Send Notifications API endpoint
        req = urllib2.Request('https://api.pushy.me/push?api_key=' + apiKey)

        # Set Content-Type header since we're sending JSON
        req.add_header('Content-Type', 'application/json')

        try:
           # Actually send the push
           response = urllib2.urlopen(req, json.dumps(postData))
        except urllib2.HTTPError, e:
           # Print response errors
           print "Pushy API returned HTTP error " + str(e.code) + ": " + e.read()