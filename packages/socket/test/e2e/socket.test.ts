import http from 'http'
import _ from 'lodash'
import { v4 as uuid } from 'uuid'
import { Conversation, Message, MessagingSocket } from '../../src'

const MESSAGING_SERVER_URL = 'http://localhost:3100'

const createClient = async () => {
  const url = new URL(MESSAGING_SERVER_URL)
  const options = {
    protocol: url.protocol,
    hostname: url.hostname,
    port: url.port,
    path: '/api/v1/admin/clients',
    method: 'POST',
    headers: { 'x-bp-messaging-admin-key': process.env.ADMIN_KEY }
  }

  return new Promise<string>((resolve, reject) => {
    const req = http.request(options, (resp) => {
      let data = ''

      resp.on('data', (chunk) => {
        data += chunk
      })

      resp.on('end', () => {
        resolve(JSON.parse(data).id)
      })
    })

    req.on('error', (err) => {
      reject(err)
    })

    req.end()
  })
}

describe('Socket Client', () => {
  const state: {
    first: {
      socket: MessagingSocket
      activeConversation?: Conversation
      conversations: Conversation[]
      messages: Message[]
      clientId: string
      userId: string
      userToken: string
    }
    second: {
      socket: MessagingSocket
      activeConversation?: Conversation
      conversations: Conversation[]
      messages: Message[]
      clientId: string
      userId: string
      userToken: string
    }

    invalidSocket: MessagingSocket
  } = {
    first: {
      activeConversation: undefined,
      conversations: [],
      messages: [],
      clientId: '',
      userId: '',
      userToken: '',
      socket: new MessagingSocket({
        url: MESSAGING_SERVER_URL,
        clientId: uuid()
      })
    },

    second: {
      activeConversation: undefined,
      conversations: [],
      messages: [],
      clientId: '',
      userId: '',
      userToken: '',
      socket: new MessagingSocket({
        url: MESSAGING_SERVER_URL,
        clientId: uuid()
      })
    },

    invalidSocket: new MessagingSocket({
      url: MESSAGING_SERVER_URL,
      clientId: uuid()
    })
  }

  beforeAll(async () => {
    state.first.clientId = await createClient()
    ;(state.first.socket.clientId as string) = state.first.clientId

    state.second.clientId = await createClient()
    ;(state.second.socket.clientId as string) = state.second.clientId
  })

  describe('Connect', () => {
    afterEach(() => {
      // Remove listeners manually so we don't have many connect listeners
      state.first.socket.removeListeners('connect')
      state.second.socket.removeListeners('connect')
    })

    test('Should connect without errors when clientId is valid', async () => {
      const promise = new Promise<void>((resolve) => {
        state.first.socket.on('connect', (creds) => {
          state.first.userId = creds.userId
          state.first.userToken = creds.userToken

          expect(state.first.socket.userId).toEqual(creds.userId)
          expect(state.first.socket.creds).toEqual(creds)

          resolve()
        })
      })

      await state.first.socket.connect()
      await promise
    })

    test('Should be able to connect more than one client', async () => {
      const promise = new Promise<void>((resolve) => {
        state.second.socket.on('connect', (creds) => {
          state.second.userId = creds.userId
          state.second.userToken = creds.userToken

          expect(state.second.socket.userId).toEqual(creds.userId)
          expect(state.second.socket.creds).toEqual(creds)

          resolve()
        })
      })

      await state.second.socket.connect()
      await promise
    })

    test('Should be able to re-connect with own credentials', async () => {
      const promise = new Promise<void>((resolve) => {
        state.first.socket.on('connect', (creds) => {
          expect(creds.userId).toEqual(state.first.userId)
          expect(creds.userToken).toEqual(state.first.userToken)

          resolve()
        })
      })

      await state.first.socket.connect({ userId: state.first.userId, userToken: state.first.userToken })
      await promise
    })

    test('Should connect with new credentials when trying to connect with other clients credentials', async () => {
      const promise = new Promise<void>((resolve) => {
        state.first.socket.on('connect', (creds) => {
          expect(creds.userId).not.toEqual(state.first.userId)
          expect(creds.userToken).not.toEqual(state.first.userToken)

          state.first.userId = creds.userId
          state.first.userToken = creds.userToken

          resolve()
        })
      })

      await state.first.socket.connect({ userId: state.second.userId, userToken: state.second.userToken })
      await promise
    })

    test('Should not connect if clientId is invalid', async () => {
      await expect(state.invalidSocket.connect()).rejects.toEqual('Client not found')
    })

    test('Should not connect if URL is invalid', async () => {
      const invalidSocket = new MessagingSocket({
        url: 'http://invalid.url',
        clientId: uuid()
      })
      await expect(invalidSocket.connect()).rejects.toEqual('websocket error')
    })

    test("Should send a connection time out error if the client can't connect in a given amount of time", (done) => {
      jest.useFakeTimers('modern')
      jest.doMock('socket.io-client', () =>
        jest.fn().mockImplementation(() => ({
          on: jest.fn(),
          connect: jest.fn()
        }))
      )
      const MessagingSocketMocked = require('../../src/socket').MessagingSocket

      const timeoutSocket: MessagingSocket = new MessagingSocketMocked({
        url: MESSAGING_SERVER_URL,
        clientId: uuid()
      })

      timeoutSocket.connect().catch((err) => {
        expect(err).toEqual('connection timed out')
        done()
      })
      jest.runOnlyPendingTimers()
      jest.useRealTimers()
    }, 10000)
  })

  describe('GetUser', () => {
    test('Should be able to get a user when authenticated', async () => {
      const user = await state.first.socket.getUser()

      expect(user!.id).toEqual(state.first.userId)
      expect(user!.clientId).toEqual(state.first.clientId)

      {
        const user = await state.second.socket.getUser()

        expect(user!.id).toEqual(state.second.userId)
        expect(user!.clientId).toEqual(state.second.clientId)
      }
    })

    test('Should not be able to get a user when disconnected', async () => {
      await expect(state.invalidSocket.getUser()).rejects.toThrow('Client is disconnected')
    })
  })

  describe('CreateConversation', () => {
    test('Should be able to create a conversation with a connected socket', async () => {
      const conversation = await state.first.socket.createConversation()

      expect(conversation.clientId).toBe(state.first.socket.clientId)
      expect(conversation.userId).toBe(state.first.userId)
      expect(state.first.socket.conversationId).toEqual(conversation.id)

      state.first.activeConversation = conversation
      state.first.conversations.push(conversation)

      {
        const conversation = await state.second.socket.createConversation()

        expect(conversation.clientId).toBe(state.second.socket.clientId)
        expect(conversation.userId).toBe(state.second.userId)
        expect(state.second.socket.conversationId).toEqual(conversation.id)

        state.second.activeConversation = conversation
        state.second.conversations.push(conversation)
      }
    })

    test('Should be able to create more than one conversation with a connected socket', async () => {
      const conversation = await state.first.socket.createConversation()

      expect(conversation.clientId).toBe(state.first.socket.clientId)
      expect(conversation.userId).toBe(state.first.userId)
      expect(state.first.socket.conversationId).toEqual(conversation.id)

      state.first.activeConversation = conversation
      state.first.conversations.push(conversation)

      {
        const conversation = await state.second.socket.createConversation()

        expect(conversation.clientId).toBe(state.second.socket.clientId)
        expect(conversation.userId).toBe(state.second.userId)
        expect(state.second.socket.conversationId).toEqual(conversation.id)

        state.second.activeConversation = conversation
        state.second.conversations.push(conversation)
      }
    })

    test('Should not be able to create a conversation with a disconnected socket', async () => {
      await expect(state.invalidSocket.createConversation()).rejects.toThrow('Client is disconnected')
    })
  })

  describe('GetConversation', () => {
    test('Should be able to get a conversation with a connected socket', async () => {
      const conversation = await state.first.socket.getConversation(state.first.activeConversation!.id)

      expect(conversation!.clientId).toBe(state.first.socket.clientId)
      expect(conversation!.userId).toBe(state.first.userId)
    })

    test('Should return the active conversation by default', async () => {
      const conversation = await state.first.socket.getConversation()

      expect(conversation!.clientId).toBe(state.first.socket.clientId)
      expect(conversation!.userId).toBe(state.first.userId)
    })

    test('Should not be able to get a conversation of another socket client', async () => {
      await expect(state.first.socket.getConversation(state.second.activeConversation!.id)).rejects.toThrow(
        'Conversation does not exist'
      )
    })

    test('Should not be able to get a conversation with a disconnected socket', async () => {
      await expect(state.invalidSocket.getConversation()).rejects.toThrow('Client is disconnected')
    })
  })

  describe('SendText', () => {
    test('Should be able to send a text message when properly authenticated', async () => {
      const text = 'Hello!'
      const message = await state.first.socket.sendText(text)

      expect(message.authorId).toBe(state.first.userId)
      expect(message.conversationId).toBe(state.first.activeConversation!.id)
      expect(message.payload).toEqual({ text, type: 'text' })

      state.first.messages.push(message)
    })

    test('Should not be able to send a text message if disconnected', async () => {
      const text = 'Hello!'
      await expect(state.invalidSocket.sendText(text)).rejects.toThrow('Client is disconnected')
    })
  })

  describe('SendPayload', () => {
    test('Should be able to send any type of message when properly authenticated', async () => {
      const payload = { type: 'image', image: 'blabla.jpg' }
      const message = await state.first.socket.sendPayload(payload)

      expect(message.authorId).toBe(state.first.userId)
      expect(message.conversationId).toBe(state.first.activeConversation!.id)
      expect(message.payload).toEqual(payload)
      expect(message.id).not.toEqual(state.first.messages[0].id)

      state.first.messages.push(message)
    })

    test('Should not be able to send a text message if disconnected', async () => {
      const payload = { type: 'image', image: 'blabla.jpg' }
      await expect(state.invalidSocket.sendPayload(payload)).rejects.toThrow('Client is disconnected')
    })
  })

  describe('ListMessages', () => {
    test('Should be able to list messages of a user for the current conversation when authenticated', async () => {
      const messages = await state.first.socket.listMessages()

      expect(messages).toEqual(_.orderBy(state.first.messages, 'sentOn', 'desc'))
    })

    test('Should not be able to list messages of a user for the current conversation if disconnected', async () => {
      await expect(state.invalidSocket.listMessages()).rejects.toThrow('Client is disconnected')
    })
  })

  describe('SwitchConversation', () => {
    test('Should be able to switch to a certain conversation', async () => {
      const conversationId = state.first.conversations[0].id
      expect(state.first.activeConversation!.id).not.toEqual(conversationId)

      await state.first.socket.switchConversation(conversationId)

      expect(state.first.socket.conversationId).toEqual(conversationId)
    })

    test('Should be able to switch to no conversation', async () => {
      await state.first.socket.switchConversation(undefined)

      expect(state.first.socket.conversationId).toEqual(undefined)
    })

    test('Should be able to switch conversation when creating a new one', async () => {
      const conversation = await state.first.socket.createConversation()

      expect(conversation.clientId).toBe(state.first.socket.clientId)
      expect(conversation.userId).toBe(state.first.userId)

      expect(conversation.id).not.toEqual(state.first.conversations[0].id)
      expect(state.first.socket.conversationId).toEqual(conversation.id)

      const messages = await state.first.socket.listMessages()
      state.first.socket.conversationId

      expect(messages.length).toEqual(0)

      state.first.conversations.push(conversation)
    })
  })

  describe('ListConversations', () => {
    test('Should be able to list the users conversations when authenticated', async () => {
      const conversations = await state.first.socket.listConversations()

      expect(_.orderBy(conversations, 'createdOn', 'desc')).toEqual(
        _.orderBy(state.first.conversations, 'createdOn', 'desc')
      )
    })

    test('Should not be able to list the users conversations when disconnected', async () => {
      await expect(state.invalidSocket.listMessages()).rejects.toThrow('Client is disconnected')
    })
  })

  describe('DeleteConversations', () => {
    test('Should be able to delete the current user conversation when authenticated', async () => {
      state.first.activeConversation = undefined
      state.first.conversations = state.first.conversations.filter((c) => c.id !== state.first.socket.conversationId)

      await expect(state.first.socket.deleteConversation()).resolves.toEqual(true)
    })

    test('Should be able to delete a given conversation when authenticated', async () => {
      await expect(state.first.socket.deleteConversation(state.first.conversations[0].id)).resolves.toEqual(true)
    })

    test('Should not be able to delete the users conversations when disconnected', async () => {
      await expect(state.invalidSocket.deleteConversation()).rejects.toThrow('Client is disconnected')
    })
  })

  describe('Disconnect', () => {
    test('Should be able to disconnect the socket when connected', async () => {
      const spy = jest.spyOn(state.first.socket['com']['socket']!, 'disconnect')

      await state.first.socket.disconnect()

      expect(spy).toHaveBeenCalledTimes(1)

      {
        const spy = jest.spyOn(state.second.socket['com']['socket']!, 'disconnect')

        await state.second.socket.disconnect()

        expect(spy).toHaveBeenCalledTimes(1)
      }
    })

    test('Should not try to disconnect the socket when already disconnected', async () => {
      const spy = jest.spyOn(state.first.socket['com']['socket']!, 'disconnect')

      await state.first.socket.disconnect()

      expect(spy).toHaveBeenCalledTimes(0)
    })
  })
})
