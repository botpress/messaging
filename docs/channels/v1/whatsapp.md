# Whatsapp

## Requirements

You will need a Meta app to connect your bot to Whatsapp.

### Create a Meta App

To create a Meta app, go to the [Meta for Developers website](https://developers.facebook.com/) and log in with your Facebook account. Select **My Apps** from the top menu, and create a new app. For more details and assistance, visit the [Meta developer documentation](https://developers.facebook.com/docs/development).

## Channel Configuration

### API version

The whatsapp channel is made to interact with version 20.0 or higher of the Whatsapp Cloud API. If it is not the default version so it must be changed in your app's settings.

1. Go to your Meta App.
2. In the left sidebar, expand the **Settings** menu and select **Advanced**.
3. In the **Upgrade API version** section, select v20.0 or higher as the API version.
4. Click on **Save changes**.

### Add Whatsapp Product

Whatsapp is not added by default in your Meta App, so it must be added manually.

1. In the left sidebar, click on **Dashboard**.
2. In the **Add products** section, click on **Set Up** button on Whatsapp.

### App ID and Secret

The `appId` and `appSecret` are used to validate webhook requests.

1. In the left sidebar, expand the **Settings** menu and select **Basic**. Here you can find the **App ID** and **App secret**.
2. Click on the **Show** button in the **App secret** text box. Copy the **appId** and **appSecret** to your channel configuration.

### Phone Number ID and Access Token

The `phoneNumberId` and `accessToken` are used to send messages to the Whatsapp Cloud API.

1. In the left sidebar, expand the **Whatsapp** menu and select **API Setup**.
2. Click on **Generate access token**. Copy this token and paste it in the **accessToken** channel configuration.
3. Copy the **Phone number ID** and paste it in you **phoneNumberId** channel configuration.

### Verify Token

The `verifyToken` is used by Meta to verify that you are the real owner of the provided webhook.

You can generate any random alphanumerical string for this configuration. Paste it in your **verifyToken** channel configuration.

### Save Configuration

_Note: It is important you save your configuration before configuring the webhook, otherwise Whatsapp will be unable to validate the webhook url._

1. Edit your bot config.

```json
{
  // ... other data
  "messaging": {
    "channels": {
      "whatsapp": {
        "version": "1.0.0",
        "enabled": true,
        "phoneNumberId": "phone_number_id",
        "accessToken": "your_access_token",
        "appId": "app_id",
        "appSecret": "your_app_secret",
        "verifyToken": "your_verify_token"
      }
      // ... other channels can also be configured here
    }
  }
}
```

2. Restart Botpress.
3. You should see your webhook endpoint in the console on startup.

## Webhook Configuration

To receive messages from Whatsapp, you will need to setup a webhook.

1. Go to your Meta App.
2. In the left sidebar, expand the **Whatsapp** menu and select **Configuration**.
3. In the **Webhooks** section, click **Add Callback URL**.
4. Set the webhook URL to: `<EXTERNAL_URL>/api/v1/messaging/webhooks/v1/<YOUR_BOT_ID>/whatsapp`.
5. Copy paste the `verifyToken` you generated earlier.
6. Click on **Verify and save**. Make sure your channel configuration was saved before doing this step, otherwise the webhook validation will fail.
7. In the **Webhook fields** below, subscribe to **messages** to your webhook.
