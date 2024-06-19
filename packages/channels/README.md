# Botpress Messaging Channels Version 1.0.0

## Supported Channels

- Facebook Messenger
- Slack
- Smooch
- Teams
- Telegram
- Twilio
- Vonage
- Whatsapp

## Development

_Note: this documentation is for the **channel v1+ only**. For the doc on **legacy channel**, please checkout the `v1` branch and make your changes there._

**Steps:**

1. Make changes to one of the channel
1. Test those changes locally
1. When ready to deploy the new version of the channels, bump the version of this package to something higher than `v1`.
1. Use `yarn` to publish the updated package to NPM. See doc [here](../../docs/release.md) for reference.
