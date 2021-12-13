import {
  CLIENT_ID_HEADER,
  CLIENT_TOKEN_HEADER,
  Conversation,
  Message,
  MessagingClient,
  SyncRequest,
  SyncWebhook,
  User,
  uuid
} from '../../src'

const FAKE_UUID = '6a15e73d-5edc-4b90-9d2b-bf8fd0a133c1'

describe('Http Client', () => {
  test('Should create a client with credential information and URL', async () => {
    const auth = {
      clientId: FAKE_UUID,
      clientToken: FAKE_UUID
    }
    const url = 'http://messaging.best'
    const client = new MessagingClient({
      url,
      auth
    })

    expect(client.auth).toEqual(auth)
    expect(Object.keys(client.authHttp.defaults.headers.common)).toEqual(
      expect.arrayContaining([CLIENT_ID_HEADER, CLIENT_TOKEN_HEADER])
    )

    expect(client.http.defaults.baseURL).toContain(url)
  })

  const state: {
    clientId?: uuid
    clientToken?: string
    user?: User
    conversation?: Conversation
    message?: Message
    webhooks?: SyncWebhook[]
  } = {}
  const client = new MessagingClient({ url: 'http://localhost:3100' })
  const webhooks = [{ url: 'http://un.known.url' }, { url: 'http://second.un.known.url' }]

  describe('Syncs', () => {
    describe('Sync', () => {
      test('Should return a clientId/clientToken when sync is called with an empty config', async () => {
        const config: SyncRequest = {}
        const res = await client.syncs.sync(config)

        expect(res.id).toBeDefined()
        expect(res.token).toBeDefined()
        expect(res.webhooks).toEqual([])

        state.clientId = res.id
        state.clientToken = res.token
      })

      test('Should authenticate using clientId/clientToken', async () => {
        client.authenticate(state.clientId!, state.clientToken!)
      })

      test('Should return webhooks with token when provided in the config', async () => {
        const config: SyncRequest = {
          id: state.clientId,
          token: state.clientToken,
          webhooks
        }
        const res = await client.syncs.sync(config)
        state.webhooks = res.webhooks

        expect(res.id).toBeDefined()
        expect(res.token).toBeDefined()
        expect(res.webhooks.length).toEqual(webhooks.length)
        for (let i = 0; i < webhooks.length; i++) {
          expect(res.webhooks[i].url).toEqual(webhooks[i].url)
          expect(res.webhooks[i].token).toBeDefined()
        }
      })

      test('Should return the same token for the same webhooks', async () => {
        const config: SyncRequest = {
          id: state.clientId,
          token: state.clientToken,
          webhooks
        }
        const res = await client.syncs.sync(config)

        expect(res.webhooks).toEqual(state.webhooks)
      })

      test('Should throw when the provided clientId is valid but not the clientToken', async () => {
        const config: SyncRequest = { id: state.clientId, token: FAKE_UUID }

        await expect(client.syncs.sync(config)).rejects.toThrow('Request failed with status code 403')
      })

      test('Should not throw an error when the both credentials are invalid', async () => {
        const config: SyncRequest = { id: FAKE_UUID, token: FAKE_UUID }

        await expect(client.syncs.sync(config)).resolves.not.toEqual({
          id: expect.anything(),
          token: expect.anything()
        })
      })
    })
  })

  describe('User', () => {
    let secondUser: User
    describe('Create', () => {
      test('Should create a user without throwing any error', async () => {
        const user = await client.users.create()

        expect(user.clientId).toBe(state.clientId)
        expect(user.id).toBeDefined()

        state.user = user
      })

      test('Should be able to create more than one users', async () => {
        const user = await client.users.create()

        expect(user).not.toEqual(state.user)
        expect(user.clientId).toBe(state.clientId)
        expect(user.id).toBeDefined()

        secondUser = user
      })
    })

    describe('Get', () => {
      test('Should be able to get the newly created user', async () => {
        const user = await client.users.get(state.user!.id)

        expect(user).toEqual(state.user)
      })

      test('Should return undefined when the user does not exists', async () => {
        const user = await client.users.get(FAKE_UUID)

        expect(user).toBeUndefined()
      })
    })
  })

  describe('Conversation', () => {
    let secondConversation: Conversation

    describe('Create', () => {
      test('Should create a conversation without throwing any error', async () => {
        const conversation = await client.conversations.create(state.user!.id)

        expect(conversation.clientId).toBe(state.clientId)
        expect(conversation.userId).toBe(state.user!.id)
        expect(conversation.id).toBeDefined()
        expect(conversation.createdOn).toBeDefined()

        state.conversation = conversation
      })

      test('Should be able to create more than one conversation for a given user', async () => {
        const conversation = await client.conversations.create(state.user!.id)

        expect(conversation).not.toEqual(state.conversation)
        expect(conversation.clientId).toBe(state.clientId)
        expect(conversation.userId).toBe(state.user!.id)
        expect(conversation.id).toBeDefined()
        expect(conversation.createdOn).toBeDefined()

        secondConversation = conversation
      })

      test('Should throw an error if the userId does not exists', async () => {
        await expect(client.conversations.create(FAKE_UUID)).rejects.toThrow(
          new Error('Request failed with status code 404')
        )
      })
    })

    describe('Get', () => {
      test('Should be able to get the newly created conversation', async () => {
        const conversation = await client.conversations.get(state.conversation!.id)

        expect(conversation).toEqual(state.conversation)
      })

      test('Should return undefined when the conversation does not exists', async () => {
        const conversation = await client.conversations.get(FAKE_UUID)

        expect(conversation).toBeUndefined()
      })
    })

    describe('GetRecent', () => {
      test('Should be able to only get a users most recent conversations', async () => {
        const conversations = await client.conversations.getRecent(state.user!.id)

        expect(conversations).toEqual(secondConversation)
      })

      test('Should throw an error if the userId does not exists', async () => {
        await expect(client.conversations.getRecent(FAKE_UUID)).rejects.toThrow(
          new Error('Request failed with status code 404')
        )
      })
    })

    describe('List', () => {
      test('Should be able to list all the users conversations', async () => {
        const conversations = await client.conversations.list(state.user!.id)

        expect(conversations).toEqual([secondConversation, state.conversation])
      })

      test('Should be able to list a fixed number of the users conversations', async () => {
        const conversations = await client.conversations.list(state.user!.id, 1)

        expect(conversations).toEqual([secondConversation])
      })

      test('Should throw an error if the userId does not exists', async () => {
        await expect(client.conversations.list(FAKE_UUID)).rejects.toThrow(
          new Error('Request failed with status code 404')
        )
      })
    })
  })

  describe('Message', () => {
    const payload = {
      type: 'text',
      text: 'yoyo'
    }
    let secondMessage: Message

    describe('Create', () => {
      test('Should create a message without throwing any error', async () => {
        const message = await client.messages.create(state.conversation!.id, state.user!.id, payload)

        expect(message.conversationId).toBe(state.conversation!.id)
        expect(message.authorId).toBe(state.user!.id)
        expect(message.id).toBeDefined()
        expect(message.sentOn).toBeDefined()
        expect(message.payload).toEqual(payload)

        state.message = message
      })

      test('Should be able to create more then one message in a conversation', async () => {
        const message = await client.messages.create(state.conversation!.id, state.user!.id, payload)

        expect(message).not.toEqual(state.message)
        expect(message.conversationId).toBe(state.conversation!.id)
        expect(message.authorId).toBe(state.user!.id)
        expect(message.id).toBeDefined()
        expect(message.sentOn).toBeDefined()
        expect(message.payload).toEqual(payload)

        secondMessage = message
      })

      test('Should throw an error if the userId does not exists', async () => {
        await expect(client.messages.create(state.conversation!.id, FAKE_UUID, payload)).rejects.toThrow(
          new Error('Request failed with status code 404')
        )
      })

      test('Should throw an error if the conversationId does not exists', async () => {
        await expect(client.messages.create(FAKE_UUID, state.user?.id, payload)).rejects.toThrow(
          new Error('Request failed with status code 404')
        )
      })
    })

    describe('Get', () => {
      test('Should be able to get the newly created message', async () => {
        const message = await client.messages.get(state.message!.id)

        expect(message).toEqual(state.message)
      })

      test('Should return undefined when the message does not exists', async () => {
        const message = await client.messages.get(FAKE_UUID)

        expect(message).toBeUndefined()
      })
    })

    describe('List', () => {
      test('Should be able to list messages in a conversation', async () => {
        const messages = await client.messages.list(state.conversation!.id)

        expect(messages).toEqual([secondMessage, state.message])
      })

      test('Should be able to lista fixes number of messages in a conversation', async () => {
        const messages = await client.messages.list(state.conversation!.id, 1)

        expect(messages).toEqual([secondMessage])
      })

      test('Should throw an error if the conversationId does not exists', async () => {
        await expect(client.messages.list(FAKE_UUID)).rejects.toThrow(new Error('Request failed with status code 404'))
      })
    })

    describe('Delete', () => {
      test('Should be able to delete a message without throwing any error', async () => {
        const deleted = await client.messages.delete(state.message!.id)

        expect(deleted).toEqual(true)
      })

      test('Should not delete a message that was already deleted', async () => {
        const deleted = await client.messages.delete(state.message!.id)

        expect(deleted).toEqual(false)
      })

      test('Should return false if the messageId does not exists', async () => {
        const deleted = await client.messages.delete(FAKE_UUID)

        expect(deleted).toEqual(false)
      })
    })

    describe('DeleteByConversation', () => {
      test('Should be able to delete all messages from a conversation without throwing any error', async () => {
        const deleted = await client.messages.deleteByConversation(state.conversation!.id)

        // Deletes the second conversation
        expect(deleted).toEqual(1)
      })

      test('Should not delete messages that were already deleted', async () => {
        const deleted = await client.messages.deleteByConversation(state.conversation!.id)

        expect(deleted).toEqual(0)
      })

      test('Should return false if the conversationId does not exists', async () => {
        const deleted = await client.messages.deleteByConversation(FAKE_UUID)

        expect(deleted).toEqual(0)
      })
    })
  })

  describe('Health', () => {
    describe('Get', () => {
      test('Should be able to get the a clients health report', async () => {
        const healthReport = await client.health.get()

        // No report since no channel config we synced
        expect(healthReport).toEqual({ channels: {} })
      })
    })
  })
})
