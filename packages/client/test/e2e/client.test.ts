import { v4 as uuid, validate as validateUuid } from 'uuid'
import { Conversation, Message, MessagingChannel, MessagingClient, SyncWebhook, User } from '../../src'

const FAKE_UUID = uuid()
const FAKE_CLIENT_ID = uuid()
const FAKE_CLIENT_TOKEN =
  'djhejsfj3498frh9erf8j3948fj398fj3498fj349f8j3dfgfdgfdsrswe49834jf934fj93284fj3498fj3498fj3498f3j4f983ffsdfddasddasdasdasdasda'

describe('Http Client', () => {
  test('Should create a client with credential information and URL', async () => {
    const url = 'http://messaging.best'
    const client = new MessagingClient({
      url,
      clientId: FAKE_CLIENT_ID,
      clientToken: FAKE_CLIENT_TOKEN
    })

    expect(client.clientToken).toEqual(FAKE_CLIENT_TOKEN)
    expect((client as any).channel.http.defaults.baseURL).toContain(url)
  })

  const url = 'http://localhost:3100'
  const adminClient = new MessagingChannel({ url, adminKey: process.env.ADMIN_KEY })

  describe('Clients', () => {
    const customId = uuid()

    test('Should create a messaging client', async () => {
      const client = await adminClient.createClient()

      expect(validateUuid(client.id)).toBeTruthy()
      expect(client.token).toBeDefined()
      expect(client.token.length).toBe(125)
    })

    test('Should create a messaging client that has the specified id', async () => {
      const client = await adminClient.createClient(customId)

      expect(validateUuid(client.id)).toBeTruthy()
      expect(client.id).toBe(customId)
      expect(client.token).toBeDefined()
      expect(client.token.length).toBe(125)
    })

    test('Should not be able to create another client with the same id', async () => {
      await expect(adminClient.createClient(customId)).rejects.toThrow(new Error('Request failed with status code 403'))
    })
  })

  const state: {
    clientId?: string
    clientToken?: string
    user?: User
    conversation?: Conversation
    message?: Message
    webhooks?: SyncWebhook[]
    userToken?: { id: string; token: string }
  } = {}
  let client: MessagingClient
  const webhooks = [{ url: 'http://un.known.url' }, { url: 'http://second.un.known.url' }]

  describe('Syncs', () => {
    describe('Sync', () => {
      test('Should return a clientId/clientToken when sync is called with an empty config', async () => {
        const res = await adminClient.createClient()

        expect(res.id).toBeDefined()
        expect(res.token).toBeDefined()

        state.clientId = res.id
        state.clientToken = res.token
      })

      test('Should authenticate using clientId/clientToken', async () => {
        client = new MessagingClient({
          url,
          clientId: state.clientId!,
          clientToken: state.clientToken!
        })
      })

      test('Should return webhooks with token when provided in the config', async () => {
        const config = {
          webhooks
        }
        const res = await client.sync(config)
        state.webhooks = res.webhooks

        expect(res.webhooks.length).toEqual(webhooks.length)
        for (let i = 0; i < webhooks.length; i++) {
          expect(res.webhooks[i].url).toEqual(webhooks[i].url)
          expect(res.webhooks[i].token).toBeDefined()
        }
      })

      test('Should return the same token for the same webhooks', async () => {
        const config = {
          webhooks
        }
        const res = await client.sync(config)

        expect(res.webhooks).toEqual(state.webhooks)
      })
    })
  })

  describe('User', () => {
    let secondUser: User
    describe('Create', () => {
      test('Should create a user without throwing any error', async () => {
        const user = await client.createUser()

        expect(user.clientId).toBe(state.clientId)
        expect(user.id).toBeDefined()

        state.user = user
      })

      test('Should be able to create more than one users', async () => {
        const user = await client.createUser()

        expect(user).not.toEqual(state.user)
        expect(user.clientId).toBe(state.clientId)
        expect(user.id).toBeDefined()

        secondUser = user
      })
    })

    describe('Get', () => {
      test('Should be able to get the newly created user', async () => {
        const user = await client.getUser(state.user!.id)

        expect(user).toEqual(state.user)
      })

      test('Should return undefined when the user does not exists', async () => {
        const user = await client.getUser(FAKE_UUID)

        expect(user).toBeUndefined()
      })
    })
  })

  describe('Conversation', () => {
    let secondConversation: Conversation

    describe('Create', () => {
      test('Should create a conversation without throwing any error', async () => {
        const conversation = await client.createConversation(state.user!.id)

        expect(conversation.clientId).toBe(state.clientId)
        expect(conversation.userId).toBe(state.user!.id)
        expect(conversation.id).toBeDefined()
        expect(conversation.createdOn).toBeDefined()

        state.conversation = conversation
      })

      test('Should be able to create more than one conversation for a given user', async () => {
        const conversation = await client.createConversation(state.user!.id)

        expect(conversation).not.toEqual(state.conversation)
        expect(conversation.clientId).toBe(state.clientId)
        expect(conversation.userId).toBe(state.user!.id)
        expect(conversation.id).toBeDefined()
        expect(conversation.createdOn).toBeDefined()

        secondConversation = conversation
      })

      test('Should throw an error if the userId does not exists', async () => {
        await expect(client.createConversation(FAKE_UUID)).rejects.toThrow(
          new Error('Request failed with status code 404')
        )
      })
    })

    describe('Get', () => {
      test('Should be able to get the newly created conversation', async () => {
        const conversation = await client.getConversation(state.conversation!.id)

        expect(conversation).toEqual(state.conversation)
      })

      test('Should return undefined when the conversation does not exists', async () => {
        const conversation = await client.getConversation(FAKE_UUID)

        expect(conversation).toBeUndefined()
      })
    })

    describe('List', () => {
      test('Should be able to list all the users conversations', async () => {
        const conversations = await client.listConversations(state.user!.id)

        expect(conversations).toEqual([secondConversation, state.conversation])
      })

      test('Should be able to list a fixed number of the users conversations', async () => {
        const conversations = await client.listConversations(state.user!.id, 1)

        expect(conversations).toEqual([secondConversation])
      })

      test('Should throw an error if the userId does not exists', async () => {
        await expect(client.listConversations(FAKE_UUID)).rejects.toThrow(
          new Error('Request failed with status code 404')
        )
      })
    })
  })

  describe('User Tokens', () => {
    test('Should create a user token without throwing any error', async () => {
      const userToken = await client.createUserToken(state.user!.id)

      expect(userToken.id).toBeDefined()
      expect(userToken.token).toBeDefined()
      expect(userToken.token.startsWith(userToken.id)).toBeTruthy()

      state.userToken = userToken
    })

    test('Should create a second user token for the same user', async () => {
      const userToken = await client.createUserToken(state.user!.id)

      expect(userToken.id).toBeDefined()
      expect(userToken.token).toBeDefined()
      expect(userToken.token.startsWith(userToken.id)).toBeTruthy()

      // should be a different token
      expect(userToken.id).not.toEqual(state.userToken?.id)
      expect(userToken.token).not.toEqual(state.userToken?.token)
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
        const message = await client.createMessage(state.conversation!.id, state.user!.id, payload)

        expect(message.conversationId).toBe(state.conversation!.id)
        expect(message.authorId).toBe(state.user!.id)
        expect(message.id).toBeDefined()
        expect(message.sentOn).toBeDefined()
        expect(message.payload).toEqual(payload)

        state.message = message
      })

      test('Should be able to create more then one message in a conversation', async () => {
        const message = await client.createMessage(state.conversation!.id, state.user!.id, payload)

        expect(message).not.toEqual(state.message)
        expect(message.conversationId).toBe(state.conversation!.id)
        expect(message.authorId).toBe(state.user!.id)
        expect(message.id).toBeDefined()
        expect(message.sentOn).toBeDefined()
        expect(message.payload).toEqual(payload)

        secondMessage = message
      })

      test('Should throw an error if the userId does not exists', async () => {
        await expect(client.createMessage(state.conversation!.id, FAKE_UUID, payload)).rejects.toThrow(
          new Error('Request failed with status code 404')
        )
      })

      test('Should throw an error if the conversationId does not exists', async () => {
        await expect(client.createMessage(FAKE_UUID, state.user?.id, payload)).rejects.toThrow(
          new Error('Request failed with status code 404')
        )
      })
    })

    describe('Get', () => {
      test('Should be able to get the newly created message', async () => {
        const message = await client.getMessage(state.message!.id)

        expect(message).toEqual(state.message)
      })

      test('Should return undefined when the message does not exists', async () => {
        const message = await client.getMessage(FAKE_UUID)

        expect(message).toBeUndefined()
      })
    })

    describe('List', () => {
      test('Should be able to list messages in a conversation', async () => {
        const messages = await client.listMessages(state.conversation!.id)

        expect(messages).toEqual([secondMessage, state.message])
      })

      test('Should be able to lista fixes number of messages in a conversation', async () => {
        const messages = await client.listMessages(state.conversation!.id, 1)

        expect(messages).toEqual([secondMessage])
      })

      test('Should throw an error if the conversationId does not exists', async () => {
        await expect(client.listMessages(FAKE_UUID)).rejects.toThrow(new Error('Request failed with status code 404'))
      })
    })

    describe('Delete', () => {
      test('Should be able to delete a message without throwing any error', async () => {
        const deleted = await client.deleteMessage(state.message!.id)

        expect(deleted).toEqual(true)
      })

      test('Should not delete a message that was already deleted', async () => {
        const deleted = await client.deleteMessage(state.message!.id)

        expect(deleted).toEqual(false)
      })

      test('Should return false if the messageId does not exists', async () => {
        const deleted = await client.deleteMessage(FAKE_UUID)

        expect(deleted).toEqual(false)
      })
    })

    describe('DeleteByConversation', () => {
      test('Should be able to delete all messages from a conversation without throwing any error', async () => {
        const deleted = await client.deleteMessagesByConversation(state.conversation!.id)

        // Deletes the second conversation
        expect(deleted).toEqual(1)
      })

      test('Should not delete messages that were already deleted', async () => {
        const deleted = await client.deleteMessagesByConversation(state.conversation!.id)

        expect(deleted).toEqual(0)
      })

      test('Should return false if the conversationId does not exists', async () => {
        const deleted = await client.deleteMessagesByConversation(FAKE_UUID)

        expect(deleted).toEqual(0)
      })
    })
  })

  describe('Health', () => {
    describe('Get', () => {
      test('Should be able to get the a clients health report', async () => {
        const healthReport = await client.getHealth()

        // No report since no channel config we synced
        expect(healthReport).toEqual({ channels: {} })
      })
    })
  })

  describe('Endpoints', () => {
    describe('Map', () => {
      const endpoint = { channel: { name: 'telegram', version: '1.0.0' }, identity: '*', sender: 'yoyo', thread: 'ya' }
      let convoId: string | undefined

      test('Should be able to map an endpoint to a conversation id', async () => {
        convoId = await client.mapEndpoint(endpoint)
        expect(validateUuid(convoId)).toBeTruthy()
      })

      test('Should be able to map the endpoint to the same conversation id again', async () => {
        const convoId2 = await client.mapEndpoint(endpoint)
        expect(convoId2).toBe(convoId)
      })

      test('Should fail to map an endpoint with an unknown channel', async () => {
        await expect(client.mapEndpoint({ ...endpoint, channel: { name: 'yoyo', version: '1.0.0' } })).rejects.toThrow(
          new Error('Request failed with status code 400')
        )
      })

      test('Should fail to map an endpoint with invalid fields', async () => {
        await expect(client.mapEndpoint({ ...endpoint, identity: null as any })).rejects.toThrow(
          new Error('Request failed with status code 400')
        )
      })

      test('Should be able to list the endpoints of a conversation to get back the same endpoint', async () => {
        const [mappedEndpoint] = await client.listEndpoints(convoId!)
        expect(mappedEndpoint).toEqual(endpoint)
      })

      test('Should be able to list the endpoints of a conversation that has not endpoints', async () => {
        const user = await client.createUser()
        const conversation = await client.createConversation(user.id)

        const endpoints = await client.listEndpoints(conversation.id)
        expect(endpoints).toEqual([])
      })
    })
  })
})
