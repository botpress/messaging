# Channels Changelog

This changelog details the changes for every channel between the 0.1.0 and 1.0.0 version.

## Channel versioning

It's now possible to use a `version` field when making a sync call that will indicate to messaging what version of a channel to use

This will configure telegram at version 1.0.0

```jsonc
{
  "channels": {
    "telegram": {
      "version": "1.0.0",
      // for 0.1.0 : "version": "0.1.0",
      "botToken": "token"
    }
  }
}
```

Note that not supplying a version number will fallback to 0.1.0 to keep backward compatibility

## Common Changes

These are the changes that were applied to all channels

- Added `/v1` to the webhook path (`/webhooks/client-id/channel-name` -> `/webhooks/v1/client-id/channel-name`)
- Added support for sending all content types

## Messenger

Messenger got a major version upgrade, as well as extra required configurations. The configurations to change the menus in messenger were removed, and should now be configured on facebook's side

- API version v3.2 -> v12.0
- Added required `appId` and `pageId` configs
- Removed `disabledActions`, `greeting`, `getStarted` and `persistentMenu` configs
- As an extra step when configuring the channel, you neeed to select v12.0 as the API version on the facebook api dashboard (the default is still v10.0)

## Smooch

Smooch was upgraded to v2 of the Smooch API. Automatic webhook creation was removed to allow for more complex integration settings on smooch (it could be re-added later as an optional config)

- API version v1 -> v2
- Added required `appId` and `webhookSecret` configs
- `secret` was renamed to `keySecret`
- Removed `forwardRawPayloads` config
- Automatic webhook creation was removed. As such an extra step of configuration is now required to create the webhook and fill in the `webhookSecret` config

## Telegram

Telegram upgraded its api version from v4.1 to v5.7 by bumping the version of the telegraf package. telegraf had breaking changes so the entire channel was rewritten. Configuration remains the same

- API version v4.1 -> v5.7

## Slack

Slack was upgraded by changing the packages we use. Instead of the deprecated @slack/events-api and @slack/interactive-messages, we use the new @slack/bolt package. We also had a dependency on an even older pacakge call @slack/rtm. This package was removed and the config to enable it `useRtm` was removed as well. Both webhooks are now configured on the same route (so no more `/slack/interactive` and `/slack/events`. Everything should point to `/slack`)

- Remove `useRtm` config
- `/slack/interactive` and `/slack/events` route are now merged into one route `/slack`

## Vonage

Vonage was upgraded from the beta v0.1 API to the v1 API. The official http client package was incomplete so a custom client was written from scratch to make requests to the vonage API. Some configs were removed to make the configuration of this channel easier. In particular there were some optional authorization settings that could be enabled on vonage that were mandatory in this channel config. We removed them as they don't offer much more security at the cost of a much more complex setup. They could be added back later as optional configs if someone really needs them. Webhook routes were also merge into a single route.

- API version v0.1 -> v1
- Removed `applicationId` config
- Removed `privateKey` config
- `/vonage/inbound` and `/vonage/status` route are now merged into one route `/vonage`

## Twilio

Twilio had no major changes in configuration or API version. The twilio package was bumped from 3.67.0 to 3.73.1. Some code was removed that was only there to keep some legacy configurations working.

## Teams

Teams didn't change API version and the package was bumped a minor version from 4.14.0 to 4.15.0

- Removed `tenantId` config
- Removed `proactiveMessages` config
