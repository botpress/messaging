# Inject

The inject script is the only file users add as a script in their website, and its purpose is to load all the required packages to start the webchat.

## Prerequisites

1.  Messaging must be running: `cd ../server && yarn start`

## Setup

1. Type `yarn` && `yarn build`
2. Type `yarn serve` then open the URL in your browser

## Trying the script in the studio (stratus)

1. Edit `packages/studio-ui/src/web/index.html` and change `<script src="https://cdn.botpress.dev/webchat/v1/inject.js"></script>` to `<script src="http://localhost:3700/inject.js"></script>`
2. Edit `packages/studio-ui/src/web/components/Emulator/EmbeddedWebchat.tsx` and change `hostUrl: 'https://cdn.botpress.dev/webchat/v1'` to `hostUrl: 'http://localhost:3700'`
