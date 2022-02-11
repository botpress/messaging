# Smooch

Smooch is now at API 2. The UI didn't change much but it's now required to create the webhook yourself

- In the same page where we generate the API key, there is an App ID section. The user needs to copy this now as well and write it as the "appId" config
- The "secret" config is now named "keySecret"
- Tell the user to copy this info into the textboxes in the UI, json config is not relevant to the cloud
- Remove the step about restarting botpress
- The user now needs to configure the webhook. They should go to the "Integrations" tab and scroll down to "API & Webooks" and click on the "Webhooks" box. There they create a webhook and paste the url given in the cdm UI. The version of the webhook has to be set to v2. They need to tick "Conversation message" and "Postbacks" in the "Basic Triggers" section when creating the webhook.
- When they are finished creating the webhook, the need to copy the webhook secret displayed in the table into the "webhookSecret" config.
