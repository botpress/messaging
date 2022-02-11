# Telegram

Telegram doesn't have any changes in configuration from the previous version.

- We don't need to tell the user to setup an https endpoint since that's already done in the cloud
- Tell the user to paste the token they generated with BotFather in the `botToken` textbox in the cdm UI instead of a config file
- The webhook is still generated automatically. The UI says what the webhook endpoint is so we don't need to say it in the doc.
