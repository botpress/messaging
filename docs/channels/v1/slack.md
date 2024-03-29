## Requirements

### Create a Slack App

You will need a Slack App to connect your bot to Slack

1. Go to your [apps page](https://api.slack.com/apps)
1. Click **Create new app**, select **From scratch** then give it a name. Remember your App's name, you'll need it in a few minutes

## Channel Configuration

## Signing Secret

The signing secret is used to verify webhook requests

1. In the left sidebar, click on **Settings** > **Basic Information**
2. Scroll down to **App Credentials** section. Copy paste the value of the signing secret to the **signingSecret** channel configuration

## Bot Token

The bot token is used to authenticate requests made to the Slack API

1. In the left sidebar, click on **Features** > **OAuth & Permissions**
1. Add `chat:write` under the **Scope** > **Bot Token Scopes** section
1. Click on **Install to Workspace** in the **OAuth Tokens for Your Workspace** section
1. Copy paste the value in **Bot User OAuth Token** to the **botToken** channel configuration

### Save Configuration

_Note: It is important you save your configuration before configuring the webhooks, otherwise Slack will be unable to validate the webhook url_

1. Edit your bot config

```json
{
  // ... other data
  "messaging": {
    "channels": {
      "slack": {
        "version": "1.0.0",
        "enabled": true,
        "signingSecret": "your_signing_secret",
        "botToken": "your_bot_token"
      }
      // ... other channels can also be configured here
    }
  }
}
```

2. Restart Botpress.
3. You should see your webhook endpoint in the console on startup.

## Webhook Configuration

### Events Webhook

Slack sends regular events such as messages to the event webhook

1. In the left sidebar, click on **Features** > **Event Subscriptions**
1. Turn on events by click the On/Off button
1. Under **Subscribe to bot event**, add `message.im` and `message.channels`
1. Set the webhook url to `<EXTERNAL_URL>/api/v1/messaging/webhooks/v1/<YOUR_BOT_ID>/slack` in the **Request URL** field
1. A yellow banner will be displayed at the top of the screen. Click the **reinstall your App** link

### Interactivity Webhook

Slack sends "interactive" events such as reactions to message to the interactivity webhook

1. In the left sidebar, click on **Features** > **Interactivity & Shortcuts**
1. Turn on interactivity by click the On/Off button
1. Set the webhook url to `<EXTERNAL_URL>/api/v1/messaging/webhooks/v1/<YOUR_BOT_ID>/slack` in the **Request URL** field
1. Click the **Save Changes** button

## Install App

### Add App to Workspace

Your slack app needs to be added to your workspace to allow Slack users to communicate with it

1. In the left sidebar, click on **Features** > **App Home**
1. Scroll down and tick **Allow users to send Slash commands and messages from the messages tab**
1. In Slack, under the **Apps** section of the sidebar, click the **+ Add apps** button. In the search bar, type the name of your Slack app. Click on your Slack app in the search results. You can now chat with your Slack App
