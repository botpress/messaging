# Routes

## Sync

POST `/api/sync`

- `path`: Suggested path for the channel webhooks
- `client`: Suggested client id
- `token`: Suggested token
- `conduits`: Dictionary of conduits to be configured
- `webhooks`: List of webhoooks

## Chat

POST `/api/chat/reply/`

- `channel`: Channel to send the message to
- `conversationId`: Id of conversation to send the message to
- `payload`: Content of the message to send (ex: `{ "type": "text", "text": "Hello!" }`)

## Conversations

Documentation coming

## Messages

Documentation coming
