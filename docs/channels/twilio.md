# Twilio

Twilio didn't change much for their API version but the UI on their website changed quite a bit since the last time the doc was updated.

- We don't need to tell the user to setup an https endpoint since that's already done in the cloud
- Tell the user to paste their info in the UI textboxes instead of a config file
- The "Account SID" and "Auth Token" are available directly from the dashboard (so the "go to setting page" instruction can be removed). Also the part about "LIVE credentials sections" is outdated. Just tell the user to copy that info from the page. They are placed in an obvious location now (the Project info)
- Setting the webhook as been made way harder for some reason. You have to go to the messaging product page (can be found by using the Explore Products link on the left panel). Then you need to click on services -> click on your service -> Sender Pool -> Click on the phone number you want to configure -> And then copy paste the webhook provided in the cdm UI in the "A message comes in" section at the bottom of the page. Note that from what I could tell these extra steps are only necessary for newer phone numbers on twilio that are associated to a messaging service. If it's not linked to a messaging services, you can still configure it the old way!
- Remove instructions about "restarting botpress". Doesn't make sense on the cloud!
