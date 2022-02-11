# Channels Documentation Changes

This document details how the documentation for channels that is currently hosted [here](https://github.com/botpress/docs/tree/master/docs/channels) should be changed to accommodate the changes that were made to the channels (detailed changelog - [here](./channels-v1.md)). They also instruct how to change the documentation to be better suited for the cloud and CDM

To make sense of this document, simply read the old documentation and look at the points listed. They comment the changes needed from top to bottom.

## Messenger

Messenger needs a few more configs and requires setting the API version to v12 in the facebook UI.

- We don't need to tell the user to setup an https endpoint since that's already done in the cloud
- Strangely we were already telling to copy their appId in the configs, even if that config did not exist. It does now so we can keep that part
- We need to tell the user to also go in the "Settings" > "Advanced" section and change their API version to v12 (or higher).
- When telling the user to add a facebook page, we should also tell them to copy that page's id and put it in the `pageId` config
- For the `verifyToken` config, it would be nice to have a button in the CDM UI to generate that random string for us.
- All the doc about greeting text, get started and persistent menu can be removed

## Smooch

Smooch is now at API 2. The UI didn't change much but it's now required to create the webhook yourself

- In the same page where we generate the API key, there is an App ID section. The user needs to copy this now as well and write it as the "appId" config
- The "secret" config is now named "keySecret"
- Tell the user to copy this info into the textboxes in the UI, json config is not relevant to the cloud
- Remove the step about restarting botpress
- The user now needs to configure the webhook. They should go to the "Integrations" tab and scroll down to "API & Webhooks" and click on the "Webhooks" box. There they create a webhook and paste the URL given in the CDM UI. The version of the webhook has to be set to v2. They need to tick "Conversation message" and "Postbacks" in the "Basic Triggers" section when creating the webhook.
- When they are finished creating the webhook, the need to copy the webhook secret displayed in the table into the "webhookSecret" config.

## Telegram

Telegram doesn't have any changes in configuration from the previous version.

- We don't need to tell the user to setup an https endpoint since that's already done in the cloud
- Tell the user to paste the token they generated with BotFather in the `botToken` textbox in the CDM UI instead of a config file
- The webhook is still generated automatically. The UI says what the webhook endpoint is so we don't need to say it in the doc.

## Slack

Slack has changes in the config and the webhook routes were merged into a single route. I found that some steps were out of order, but the UI is still the same

- There's no reason why setting the webhook in the "Interactivity & Shortcuts" section would be the first step we tell the user to do. The only reason this works is because setting this webhook does not check if the URL is valid, but the other one does! Let's keep webhook configuration as the last step for all channels.
- Need to do the Install App step before the "Allow users to send Slash commands" step. Also it's Basic Information -> "Install your app" not "Install app"
- Change the steps to copy-paste the info into textboxes on the CDM UI instead of a config file
- `useRTM` setting doesn't exist anymore so we can remove the part that mentions it
- NOW we tell the user to configure the webhooks in the "Interactivity & Shortcuts" and "Event Subscriptions". Let's tell the user to configure the "Event Subscriptions" webhook first, because this is where any error in configuration would be detected. Also, we can tell the user to copy-paste the webhook URL provided in the UI. Both webhooks now have the same route, so we just say "copy the webhook URL provided in the UI to both sections"

## Vonage

Vonage webhooks were merged into a single route. Some steps for additional authorization were removed so we can remove them from the doc

- We don't need to tell the user to setup an https endpoint since that's already done in the cloud
- We tell the user to go their account settings, but the page is now called "API Settings"
- Can remove the step about copying the Application ID
- Can remove the privateKey instructions as this config no longer exists
- For the signature secret, the signature method has to be "MD5 HASH signature" in the dropdown in the "API Settings" page
- Instead of telling the user to make a json config, we can just tell them to fill the textboxes in the CDM ui now
- Remove the step about restarting botpress
- In the section about the Sandbox, we tell the user to go to "Messages and Dispatch (beta) -> Sandbox". This page is now "Developer Tools -> Messages Sandbox"
- For the step about setting up the webhooks, the inbound and status webhooks are now the same route, and that url is available in the CDM ui so we can just say "copy paste that link for both webhooks"
- The section about file reception is not valid for the newer version of Vonage. We'll add that back later but for now, it doesn't have these features anymore so let's remove that section

## Twilio

Twilio didn't change much for their API version but the UI on their website changed quite a bit since the last time the doc was updated.

- We don't need to tell the user to setup an https endpoint since that's already done in the cloud
- Tell the user to paste their info in the UI textboxes instead of a config file
- The "Account SID" and "Auth Token" are available directly from the dashboard (so the "go to setting page" instruction can be removed). Also the part about "LIVE credentials sections" is outdated. Just tell the user to copy that info from the page. They are placed in an obvious location now (the Project info)
- Setting the webhook has been made way harder for some reason. You have to go to the messaging product page (can be found by using the Explore Products link on the left panel). Then you need to click on services -> click on your service -> Sender Pool -> Click on the phone number you want to configure -> And then copy-paste the webhook provided in the CDM UI in the "A message comes in" section at the bottom of the page. Note that from what I could tell these extra steps are only necessary for newer phone numbers on Twilio that are associated with a messaging service. If it's not linked to a messaging service, you can still configure it the old way!
- Remove instructions about "restarting botpress". Doesn't make sense on the cloud!

## Teams

Teams is mostly the same as before. So steps can be removed or simplified in the cloud

- We don't need to tell the user to setup an https endpoint since that's already done in the cloud
- The message about framework v4 still being in development is outdated so let's remove it
- When we tell the user to create the bot on the "Bot Framework Registration Page" we tell them to configure the messaging endpoint later. We don't need to wait for this step anymore so we can tell them to copy the link in the CDM ui right away
- Replace all the stuff that talks about making a json configuration by just copy pasting the info in the CDM ui
