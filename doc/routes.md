# Routes

## Sync

POST `/api/sync`

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
const { id, token, webhooks } = (await axios.post('MESSAGING_URL/api/sync', config)).data

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
await axios.post('MESSAGING_URL/api/sync', newConfig))

router.post('/mycallbackroute', (req, req) => {})
```

As you can see from the example, you need to provide your entire configuration every time you call `api/sync`. The sync api will then do a diff of the new configuration and the old one, and apply changes automatically to fit the new configuration.

## Chat

POST `/api/chat/reply/`

- `channel`: Channel to send the message to
- `conversationId`: Id of conversation to send the message to
- `payload`: Content of the message to send (ex: `{ "type": "text", "text": "Hello!" }`)

## Conversations

POST `/api/conversations`

Authorization: Basic clientId:clientToken

- `userId`: Id of the user who owns this conversation

Creates a new conversation

GET `/api/conversations/:id`

Authorization: Basic clientId:clientToken

Gets a conversation by id

GET `/api/conversations?userId=&limit=`

Authorization: Basic clientId:clientToken

Lists the conversations of a user

GET `/api/conversations/:userId/recent`

Authorization: Basic clientId:clientToken

Gets the most recent conversation of a user

## Messages

Documentation coming
