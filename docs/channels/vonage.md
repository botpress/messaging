# Vonage

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
- The section about file reception is not valid for the newer version of vonage. We'll add that back later but for now it doesn't have these features anymore so let's remove that section
