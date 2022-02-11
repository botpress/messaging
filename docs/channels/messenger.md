# Messenger

Messenger needs a few more configs and requires setting the API version to v12 in the facebook UI.

- We don't need to tell the user to setup an https endpoint since that's already done in the cloud
- Strangely we were already telling to copy their appId in the configs, even if that config did not exist. It does now so we can keep that part
- We need to tell the user to also go in the "Settings" > "Advanced" section and change their API version to v12 (or higher).
- When telling the user to add a facebook page, we should also tell them to copy that page's id and put it in the `pageId` config
- For the verifyToken config, it would be nice to have a button in the CDM ui to generate that random string for us.
- All the doc about greeting text, get started and perisitent menu can be removed
