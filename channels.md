# Channels Changelog

All channels were updated to their latest api version. This changelog details the changes for each channel

## Messenger

Messenger got a major version upgrade, as well as extra required configurations. The configurations to change the menus in messenger were removed, and should now be configured on facebook's side

- API version v3.2 -> v12.0
- Added required `appId` and `pageId` configs
- Removed `disabledActions`, `greeting`, `getStarted` and `persistentMenu` configs
- As an extra step when configuring the channel, you neeed to select v12.0 as the API version on the facebook api dashboard (the default is still v10.0)
- Added support for sending all content types

## Smooch

Smooch upgraded to the v2 of the Smooch API. Automatic webhook creation was removed to allow for more complex integration settings on smooch. Automatic webhook creation could be re-added later as an optional config

- API version v1 -> v2
- Added required `appId` and `webhookSecret` configs
- `secret` was renamed to `keySecret`
- Removed `forwardRawPayloads` config
- Automatic webhook creation was removed. As such an extra step of configuration is now required to create the webhook and fill in the `webhookSecret` config
- Added support for sending all content types

## Telegram

## Major

- Smooch: api v1 -> v2
- Telegram : telegraf 3.27.1 -> 4.6.0
- Slack: deprecated packages -> @slack/bolt
- Vonage: api v0.1 -> v1, dropped the official package

## Minor

- Twilio : twilio npm package 3.67.0 -> 3.73.1
- Teams: botbuilder 4.14.0 -> 4.15.0

## Other changes

- Added support for sending every content type on every channels
- Only one webhook route for every channel
