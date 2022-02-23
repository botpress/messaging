# Botpress Messaging Client

An HTTP client to make requests to the Botpress Messaging Server and receive webhook events using [Express](https://expressjs.com/)

## Installation

Requires Node.js 16

```
yarn add @botpress/messaging-client
npm install @botpress/messaging-client
pnpm add @botpress/messaging-client
```

## Basic Usage

Initialize the client and respond to messages

```ts
// initialize client with your credentials
const client = new MessagingClient({
  clientId: 'my-client-id',
  clientToken: 'my-client-token',
  webhookToken: 'my-webhook-token'
})

// listen for webhook events by providing an express router
client.setup(router)

// register callback method for incoming messages and respond to user
client.on('message', async (e) => {
  await client.createMessage(e.conversationId, undefined, { text: `Hello I'm a bot!` })
})
```

## More Events

The Messaging Server also produces these webhook events

```ts
client.on('user', async ({ userId }) => {
  console.log(`new user: ${userId}!`)
})

client.on('started', async ({ userId, conversationId, channel }) => {
  console.log(`new conversation started by ${userId} on ${channel} : ${conversationId}!`)
})

client.on('feedback', async ({ userId, conversationId, channel, messageId, feedback }) => {
  console.log(
    `feedback given by ${userId} on ${channel} in convo ${conversationId} on message ${messageId} : ${feedback}!`
  )
})
```
