# Vonage

## Requirements

### Create Vonage Application

You will need a Vonage Account and a Vonage Application to connect Vonage to Botpress

- [Create a Vonage Account](https://dashboard.nexmo.com/sign-up)
- [Create a Vonage Application](https://dashboard.nexmo.com/applications/new)

## Channel Configuration

### API credentials

1. Go to your [API Settings](https://dashboard.nexmo.com/settings).
1. Copy paste the API key to the **apiKey** channel configuration
1. Copy paste the API secret from the **Account credentials** section to the **apiSecret** channel configuration
1. Copy paste the signature secret from the **Signed webhooks** section to the **signatureSecret** channel configuration

### Save Configuration

1. Edit your bot config

```json
{
  // ... other data
  "messaging": {
    "channels": {
      "vonage": {
        "version": "1.0.0",
        "enabled": true,
        "apiKey": "your_api_key",
        "apiSecret": "your_api_secret",
        "signatureSecret": "your_signature_secret",
        "useTestingApi": false
      }
      // ... other channels can also be configured here
    }
  }
}
```

2. Restart Botpress.
3. You should see your webhook endpoint in the console on startup.

## Webhook Configuration

### Sandbox

You can use the Vonage sandbox to test you channel with Whatsapp

1. Set **useTestingApi** to `true` in your channel configuration
1. Go to your [Sandbox Settings](https://dashboard.nexmo.com/messages/sandbox)
1. Under `Webhooks`, type the following URLs:

   _Inbound:_ `<EXTERNAL_URL>/api/v1/messaging/webhooks/v1/<YOUR_BOT_ID>/vonage`

   _Status:_ `<EXTERNAL_URL>/api/v1/messaging/webhooks/v1/<YOUR_BOT_ID>/vonage`
