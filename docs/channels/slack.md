# Slack

Slack

- There's no reason why setting the webhook in the "Interactivity & Shortcuts" section would be the first step we tell the user to do. They only reason this works is because setting this webhook does not check if the url is valid, but the other one does! Let's keep webhook configuration as the last step for all channels.
- Need to do the Install App step before the "Allow users to send Slash commands" step. Also it's Basic Information -> "Install your app" not "Install app"
- Change the steps to copy paste the info into textboxes on the cdm UI instead of a config file
- `useRTM` setting doesn't exist anymore so we can remove the part that mentions it
- NOW we tell the user to configure the webhooks in the "Interactivity & Shortcuts" and "Event Subscriptions". Let's tell the user to configure the "Event Subscriptions" webhook first, because this is where any error in configuration would be detected. Also we can tell the user to copy paste the webhook url provided in the ui. Both webhooks now have the same route, so we just say "copy the webhook url provided in the ui to both sections"
