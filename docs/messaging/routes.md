# Routes

## Sync

POST `/api/v1/sync`

- `channels`: Dictionary of channel configurations
- `webhooks`: List of webhoook configurations
- `id` : `null` or the id of an existing client
- `token` : `null` or the token of the provided client

`returns`

- `id` : Id of the client
- `token` : Token of the client
- `webhooks`: List of configured webhooks with tokens

`or`

- `403` : if a valid client `id` with an invalid `token` was provided

The sync api provides an easy way to setup everything you need in a single api call. It connects channels to receive messages, and webhooks to send these messages back to a provided url.

The api returns a client id and token that can be used to reply to messages. It also returns a list of configured webhooks with a unique token for each (to validate that the requests are authentic).

You can also supply a client id and token when making a sync request. This allows you to change the configuration of an existing client instead of creating a new one.

### Example

```ts
const config = {
  channels: {
    telegram: {
      enabled: true,
      botToken: 'my-telegram-bot-toke'
    },
    slack: {
      enabled: true,
      signingSecret: "my-slack-signing-secret",
      botToken: "my-slack-bot-token"
    }
  },
  webhooks: [{ url: 'https://mywebsite.com/mycallback' }]
}

// This request creates a new client and token because a client id wasn't supplied.
// It will also configure the telegram and slack channel, as well as return a token for the provided webhook
const { id, token, webhooks } = (await axios.post('MESSAGING_URL/api/v1/sync', config)).data

const newConfig = {
  id,
  token,
  channels: {
    telegram: {
      enabled: true,
      botToken: 'my-telegram-bot-toke'
    },
    twilio: {
      enabled: true,
      accountSID: "my-twilio-account-sid",
      authToken: "my-twilio-auth-token"
    },
  },
  webhooks: [{ url: 'https://mywebsite.com/mycallback' }]
}

// This request won't create a new client because we gave it our previously obtained client id along with
// the correct token. It will however update the configuration of our existing client. In this case the
// twilio channel will be configured, and the slack channel will be unconfigured
await axios.post('MESSAGING_URL/api/v1/sync', newConfig))

router.post('/mycallbackroute', (req, req) => {})
```

As you can see from the example, you need to provide your entire configuration every time you call `api/sync`. The sync api will then do a diff of the new configuration and the old one, and apply changes automatically to fit the new configuration.

## Clients

GET `/api/v1/clients`

x-bp-messaging-client-id: `clientId`

x-bp-messaging-client-token: `clientToken`

Checks if client exists

## Health

GET `/api/v1/health`

x-bp-messaging-client-id: `clientId`

x-bp-messaging-client-token: `clientToken`

Provides information on configured channels

## Users

POST `/api/v1/users`

x-bp-messaging-client-id: `clientId`

x-bp-messaging-client-token: `clientToken`

Creates a new users

GET `/api/v1/users/:id`

x-bp-messaging-client-id: `clientId`

x-bp-messaging-client-token: `clientToken`

Get a user by id

## Conversations

POST `/api/v1/conversations`

x-bp-messaging-client-id: `clientId`

x-bp-messaging-client-token: `clientToken`

- `userId`: Id of the user who owns this conversation

Creates a new conversation

GET `/api/v1/conversations/:id`

x-bp-messaging-client-id: `clientId`

x-bp-messaging-client-token: `clientToken`

Gets a conversation by id

GET `/api/v1/conversations/user/:userId?limit=`

x-bp-messaging-client-id: `clientId`

x-bp-messaging-client-token: `clientToken`

Lists the conversations of a user

## Messages

POST `/api/v1/messages`

x-bp-messaging-client-id: `clientId`

x-bp-messaging-client-token: `clientToken`

- `conversationId`: Id of the conversation
- `authorId`: Id of the writer of the message (null for bot)
- `payload`: Content of the message

Creates a new message

POST `/api/v1/messages/collect`

x-bp-messaging-client-id: `clientId`

x-bp-messaging-client-token: `clientToken`

- `conversationId`: Id of the conversation
- `authorId`: Id of the writer of the message
- `payload`: Content of the message
- `timeout`: Optional. Timeout for the message collection (max 50s)

Creates a new message and collects responses

GET `/api/v1/messages/:id`

x-bp-messaging-client-id: `clientId`

x-bp-messaging-client-token: `clientToken`

Gets a message by id

DELETE `/api/v1/messages/:id`

x-bp-messaging-client-id: `clientId`

x-bp-messaging-client-token: `clientToken`

Deletes a message by id

GET `/api/v1/messages/conversation/:conversationId?limit=`

x-bp-messaging-client-id: `clientId`

x-bp-messaging-client-token: `clientToken`

List messages of a conversation

DELETE `/api/v1/messages/conversation/:conversationId`

x-bp-messaging-client-id: `clientId`

x-bp-messaging-client-token: `clientToken`

Deletes all messages of a conversation

## Endpoints

POST `/api/v1/endpoints/map`

x-bp-messaging-client-id: `clientId`

x-bp-messaging-client-token: `clientToken`

Maps an endpoints and returns a conversation id

GET `/api/v1/endpoints/conversation/:conversationId`

x-bp-messaging-client-id: `clientId`

x-bp-messaging-client-token: `clientToken`

List endpoints of a conversation
