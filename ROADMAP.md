# Unofficial Messaging Roadmap

_Note: this is an **unofficial** roadmap and should only serve as an example of what can be improved in messaging in the future_

**Tasks:**

- The Sandbox feature (more than 50% done)
- Add example on how to create a custom channel: https://github.com/botpress/custom-channel/blob/master/src/index.ts
- Add new channels like Discord, Reddit, Email, ...
- Add the possibility to delete content (messages, conversations, users, etc)
- Add the possibility to set custom user attributes when using the webchat and fetch those attributes when using any other channel (e.g. make an API call to fetch the user's Microsoft profile when using Teams)
- Remove the built-in authentication mechanism (clientToken) in favor of the VPC auth.

Also :

    Private bots (right now websocket are not protected by anything)
    Multichannel convo (I think this already works if you remove a unique constraint somewhere)
    A bit overkill but : multi user convo. Makes hitl implementation less of a hack if you can just add someone to the conversation
    For the sandbox you need a token mechanism. Otherwise anyone can setup a sandbox using your clientId (not a problem if all bots are public though). Right now it works by asking for a clientId and making a link to your endpoint
    Pulic converse (there's no way to provision API routes at the moment that don't require clientId + token. Could work with user tokens)
    Direct connect to the studio using websocket to allow bot developere to test their local bots with live or sandbox channels
    Automated testing of channels

There's probably more but that's what I can think of as of now. Next doc you could make a glossary. There's a lot of random words used all of the code (most famous one : conduit).
