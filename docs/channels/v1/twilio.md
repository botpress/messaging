## Requirements

Create a Twilio account and purchase a Twilio phone number

## Channel Configuration

### Account SID and Auth Token

1. Go to you Twilio [console dashboard](https://console.twilio.com/?frameUrl=/console)
1. Scroll down and copy your Account SID and Auth Token from the **Project Info** section and paste them in the **accountSID** and **authToken** channel configurations

### Save Configuration

1. Edit your bot config

```json
{
  // ... other data
  "messaging": {
    "channels": {
      "twilio": {
        "version": "1.0.0",
        "enabled": true,
        "accountSID": "your_account_sid",
        "authToken": "your_auth_token"
      }
      // ... other channels can also be configured here
    }
  }
}
```

2. Restart Botpress.
3. You should see your webhook endpoint in the console on startup.

## Webhook Configuration

To receive messages from Twilio, you will need to setup a webhook

1. Click on **Explore Products** in the left panel
1. Click on **Messaging**
1. Click on **Services** in the left panel
1. Click on your service (if you haven't already created your service, create a messaging service and add your phone as a sender)
1. Click on **Sender Pool** in the left panel
1. Click on your phone number
1. Scroll down the phone number settings page
1. Set **A Message Comes In** to `<EXTERNAL_URL>/api/v1/messaging/webhooks/v1/<YOUR_BOT_ID/twilio`.
