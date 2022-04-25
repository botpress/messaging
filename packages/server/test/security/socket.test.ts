import axios from 'axios'
import io from 'socket.io-client'
import { v4 as uuid } from 'uuid'
import froth from './mocha-froth'

const HOST = `http://localhost:${process.env.PORT}`
const TOKEN_LENGTH = 125
const FAKE_CLIENT_ID = uuid()
const FAKE_USER_TOKEN = froth(TOKEN_LENGTH, TOKEN_LENGTH, {
  none: false,
  foreign: false,
  symbols: false,
  backslashing: false,
  quotes: false,
  whitespace: false
})
const DEFAULT_PAYLOAD = { type: 'text', text: 'text' }

const socket = (
  clientId: string,
  setSocket?: (socket: ReturnType<typeof io>) => void,
  userId?: string,
  userToken?: string
) => {
  return new Promise((resolve, reject) => {
    const auth: any = { clientId }
    if (userId && userToken) {
      auth.creds = { userId, userToken }
    }

    const socket = io(HOST, {
      transports: ['websocket'],
      auth,
      autoConnect: false
    })

    socket.on('login', async (message) => {
      setSocket?.(socket)
      resolve(message)
    })

    socket.on('connect_error', (err) => {
      socket.close()
      reject(err.message)
    })

    socket.connect()
  })
}

const clients: any = {
  first: {
    clientId: '',
    clientToken: '',
    userToken: '',
    userId: '',
    conversationId: '',
    messageId: ''
  },
  second: {
    clientId: '',
    clientToken: '',
    userToken: '',
    userId: '',
    conversationId: '',
    messageId: ''
  }
}

const shouldThrow = async (func: Function, onError: (err: unknown) => void) => {
  try {
    await func()

    throw new Error('Function did not throw an error')
  } catch (err) {
    onError(err)
  }
}

const waitForResponse = async (socket: ReturnType<typeof io>, id: string) => {
  return new Promise((resolve, reject) => {
    const callback = async (message: any) => {
      if (message.request === id) {
        socket.off('message', callback)

        if (message.data.error) {
          reject(message.data.message)
        } else {
          resolve(message.data)
        }
      }
    }

    socket.on('message', callback)
  })
}

describe('Socket', () => {
  afterAll(() => {
    clients.first.socket?.disconnect()
    clients.second.socket?.disconnect()
  })

  const createClient = async () => {
    const options = {
      headers: { 'x-bp-messaging-admin-key': process.env.ADMIN_KEY! }
    }

    const res = await axios.post(`${HOST}/api/v1/admin/clients`, undefined, options)

    expect(res.data).toEqual({ id: expect.anything(), token: expect.anything() })
    expect(res.status).toEqual(201)

    return res.data
  }

  test('Should be able to create clients', async () => {
    const res = await createClient()

    clients.first.clientId = res.id
    clients.first.clientToken = res.token

    {
      const res = await createClient()

      clients.second.clientId = res.id
      clients.second.clientToken = res.token

      expect(res.id).not.toEqual(clients.first.clientId)
      expect(res.token).not.toEqual(clients.first.clientToken)
    }
  })

  describe('Connect', () => {
    test('Should be able to connect without credentials', async () => {
      const com: any = await socket(clients.first.clientId, (socket) => socket.disconnect())

      clients.first.userId = com.userId
      clients.first.userToken = com.userToken

      {
        const com: any = await socket(clients.second.clientId, (socket) => socket.disconnect())

        clients.second.userId = com.userId
        clients.second.userToken = com.userToken

        expect(clients.first.userId).not.toEqual(clients.second.userId)
        expect(clients.first.userToken).not.toEqual(clients.second.userToken)
      }
    })

    test('Should be able to connect with user credentials', async () => {
      const com: any = await socket(
        clients.first.clientId,
        (socket) => (clients.first.socket = socket),
        clients.first.userId,
        clients.first.userToken
      )

      expect(com.userId).toEqual(clients.first.userId)

      {
        const com: any = await socket(
          clients.second.clientId,
          (socket) => (clients.second.socket = socket),
          clients.second.userId,
          clients.second.userToken
        )

        expect(com.userId).toEqual(clients.second.userId)
      }
    })

    test('Should return valid credentials if invalid one are sent', async () => {
      const com = await socket(
        clients.first.clientId,
        (socket) => socket.disconnect(),
        clients.first.userId,
        FAKE_USER_TOKEN
      )

      expect(com).toEqual({ userId: expect.anything(), userToken: expect.anything() })
    })

    test('Should not connect if the clientId does not exists', async () => {
      await shouldThrow(
        async () => socket(FAKE_CLIENT_ID, (socket) => socket.disconnect(), FAKE_CLIENT_ID, FAKE_USER_TOKEN),
        (err) => expect(err).toEqual('Client not found')
      )
    })
  })

  describe('User', () => {
    describe('Get', () => {
      test('Should be able to get info about the user currently authenticated', async () => {
        const id = uuid()
        await clients.first.socket.send({ request: id, type: 'users.get', data: {} })
        const user: any = await waitForResponse(clients.first.socket, id)

        expect(user.id).toEqual(clients.first.userId)
        expect(user.clientId).toEqual(clients.first.clientId)

        {
          const id = uuid()
          await clients.second.socket.send({ request: id, type: 'users.get', data: {} })
          const user: any = await waitForResponse(clients.second.socket, id)

          expect(user.id).toEqual(clients.second.userId)
          expect(user.clientId).toEqual(clients.second.clientId)
        }
      })

      test('Should not be able to get info about another user', async () => {
        const id = uuid()
        await clients.first.socket.send({ request: id, type: 'users.get', data: { userId: clients.second.userId } })
        await shouldThrow(
          async () => waitForResponse(clients.first.socket, id),
          (err) => expect(err).toEqual('"userId" is not allowed')
        )
      })
    })
  })

  describe('Conversation', () => {
    describe('Create', () => {
      test('Should be able to create conversations', async () => {
        const id = uuid()
        await clients.first.socket.send({ request: id, type: 'conversations.create', data: {} })
        const conversation: any = await waitForResponse(clients.first.socket, id)
        clients.first.conversationId = conversation.id

        expect(conversation).toEqual({
          id: expect.anything(),
          userId: clients.first.userId,
          clientId: clients.first.clientId,
          createdOn: expect.anything()
        })

        {
          const id = uuid()
          await clients.second.socket.send({ request: id, type: 'conversations.create', data: {} })
          const conversation: any = await waitForResponse(clients.second.socket, id)
          clients.second.conversationId = conversation.id

          expect(conversation).toEqual({
            id: expect.anything(),
            userId: clients.second.userId,
            clientId: clients.second.clientId,
            createdOn: expect.anything()
          })
        }
      })
    })

    describe('Start', () => {
      test('Should be able to start a conversation', async () => {
        const id = uuid()
        await clients.first.socket.send({
          request: id,
          type: 'conversations.start',
          data: { id: clients.first.conversationId }
        })
        const res: any = await waitForResponse(clients.first.socket, id)
        expect(res).toEqual(true)

        {
          const id = uuid()
          await clients.second.socket.send({
            request: id,
            type: 'conversations.start',
            data: { id: clients.second.conversationId }
          })
          const res: any = await waitForResponse(clients.second.socket, id)
          expect(res).toEqual(true)
        }
      })

      test('Should not be able to start the conversation of another user', async () => {
        const id = uuid()
        await clients.first.socket.send({
          request: id,
          type: 'conversations.start',
          data: { id: clients.second.conversationId }
        })
        await shouldThrow(
          async () => waitForResponse(clients.first.socket, id),
          (err) => expect(err).toEqual('Conversation does not exist')
        )
      })
    })

    describe('Get', () => {
      test('Should be able to get a conversation', async () => {
        const id = uuid()
        await clients.first.socket.send({
          request: id,
          type: 'conversations.get',
          data: { id: clients.first.conversationId }
        })
        const conversation: any = await waitForResponse(clients.first.socket, id)

        expect(conversation).toEqual({
          id: clients.first.conversationId,
          userId: clients.first.userId,
          clientId: clients.first.clientId,
          createdOn: expect.anything()
        })

        {
          const id = uuid()
          await clients.second.socket.send({
            request: id,
            type: 'conversations.get',
            data: { id: clients.second.conversationId }
          })
          const conversation: any = await waitForResponse(clients.second.socket, id)

          expect(conversation).toEqual({
            id: clients.second.conversationId,
            userId: clients.second.userId,
            clientId: clients.second.clientId,
            createdOn: expect.anything()
          })
        }
      })

      test('Should not be able to get the conversation of another user', async () => {
        const id = uuid()
        await clients.first.socket.send({
          request: id,
          type: 'conversations.get',
          data: { id: clients.second.conversationId }
        })
        await shouldThrow(
          async () => waitForResponse(clients.first.socket, id),
          (err) => expect(err).toEqual('Conversation does not exist')
        )
      })
    })

    describe('List', () => {
      test('Should be able to list conversations', async () => {
        const id = uuid()
        const limit = 1
        await clients.first.socket.send({
          request: id,
          type: 'conversations.list',
          data: { limit }
        })
        const conversations: any = await waitForResponse(clients.first.socket, id)

        expect(conversations.length).toEqual(limit)
        expect(conversations[0]).toEqual({
          id: clients.first.conversationId,
          userId: clients.first.userId,
          clientId: clients.first.clientId,
          createdOn: expect.anything()
        })

        {
          const id = uuid()
          await clients.second.socket.send({
            request: id,
            type: 'conversations.list',
            data: { limit }
          })
          const conversations: any = await waitForResponse(clients.second.socket, id)

          expect(conversations.length).toEqual(limit)
          expect(conversations[0]).toEqual({
            id: clients.second.conversationId,
            userId: clients.second.userId,
            clientId: clients.second.clientId,
            createdOn: expect.anything()
          })
        }
      })
    })

    describe('Delete', () => {
      test('Should be able to delete conversations', async () => {
        let id = uuid()
        await clients.first.socket.send({ request: id, type: 'conversations.create', data: {} })
        const conversation: any = await waitForResponse(clients.first.socket, id)

        id = uuid()
        await clients.first.socket.send({
          request: id,
          type: 'conversations.delete',
          data: { id: conversation.id }
        })
        const res: any = await waitForResponse(clients.first.socket, id)
        expect(res).toEqual(true)
      })

      test('Should not be able to delete the conversation of another user', async () => {
        let id = uuid()
        await clients.first.socket.send({ request: id, type: 'conversations.create', data: {} })
        const conversation: any = await waitForResponse(clients.first.socket, id)

        id = uuid()
        await clients.second.socket.send({
          request: id,
          type: 'conversations.delete',
          data: { id: conversation.id }
        })
        await shouldThrow(
          async () => waitForResponse(clients.second.socket, id),
          (err) => expect(err).toEqual('Conversation does not exist')
        )
      })
    })
  })

  describe('Message', () => {
    describe('Create', () => {
      test('Should be able to create messages', async () => {
        const id = uuid()
        await clients.first.socket.send({
          request: id,
          type: 'messages.create',
          data: { conversationId: clients.first.conversationId, payload: DEFAULT_PAYLOAD }
        })
        const message: any = await waitForResponse(clients.first.socket, id)
        clients.first.messageId = message.id

        expect(message).toEqual({
          id: expect.anything(),
          authorId: clients.first.userId,
          conversationId: clients.first.conversationId,
          payload: DEFAULT_PAYLOAD,
          sentOn: expect.anything()
        })

        {
          const id = uuid()
          await clients.second.socket.send({
            request: id,
            type: 'messages.create',
            data: { conversationId: clients.second.conversationId, payload: DEFAULT_PAYLOAD }
          })
          const message: any = await waitForResponse(clients.second.socket, id)
          clients.second.messageId = message.id

          expect(message).toEqual({
            id: expect.anything(),
            authorId: clients.second.userId,
            conversationId: clients.second.conversationId,
            payload: DEFAULT_PAYLOAD,
            sentOn: expect.anything()
          })
        }
      })

      test('Should not be able to create messages in the conversation of another user', async () => {
        const id = uuid()
        const payload = { type: 'text', text: 'text' }
        await clients.first.socket.send({
          request: id,
          type: 'messages.create',
          data: { conversationId: clients.second.conversationId, payload }
        })
        await shouldThrow(
          async () => waitForResponse(clients.first.socket, id),
          (err) => expect(err).toEqual('Conversation does not exist')
        )
      })
    })

    describe('List', () => {
      test('Should be able to list messages', async () => {
        const id = uuid()
        const limit = 1
        await clients.first.socket.send({
          request: id,
          type: 'messages.list',
          data: { conversationId: clients.first.conversationId, limit }
        })
        const messages: any = await waitForResponse(clients.first.socket, id)

        expect(messages.length).toEqual(limit)
        expect(messages[0]).toEqual({
          id: clients.first.messageId,
          authorId: clients.first.userId,
          conversationId: clients.first.conversationId,
          payload: DEFAULT_PAYLOAD,
          sentOn: expect.anything()
        })

        {
          const id = uuid()
          await clients.second.socket.send({
            request: id,
            type: 'messages.list',
            data: { conversationId: clients.second.conversationId, limit }
          })
          const messages: any = await waitForResponse(clients.second.socket, id)

          expect(messages.length).toEqual(limit)
          expect(messages[0]).toEqual({
            id: clients.second.messageId,
            authorId: clients.second.userId,
            conversationId: clients.second.conversationId,
            payload: DEFAULT_PAYLOAD,
            sentOn: expect.anything()
          })
        }
      })

      test('Should not be able to list messages of another user', async () => {
        const id = uuid()
        const limit = 1
        await clients.first.socket.send({
          request: id,
          type: 'messages.list',
          data: { conversationId: clients.second.conversationId, limit }
        })
        await shouldThrow(
          async () => waitForResponse(clients.first.socket, id),
          (err) => expect(err).toEqual('Conversation does not exist')
        )
      })
    })

    describe('Feedback', () => {
      test('Should be able to send feedback on messages', async () => {
        const id = uuid()
        await clients.first.socket.send({
          request: id,
          type: 'messages.feedback',
          data: { messageId: clients.first.messageId, feedback: -1 }
        })
        const feedback: any = await waitForResponse(clients.first.socket, id)
        expect(feedback).toEqual(true)

        {
          const id = uuid()
          await clients.second.socket.send({
            request: id,
            type: 'messages.feedback',
            data: { messageId: clients.second.messageId, feedback: -1 }
          })
          const feedback: any = await waitForResponse(clients.second.socket, id)
          expect(feedback).toEqual(true)
        }
      })

      test('Should not be able to send feedback on messages of another user', async () => {
        const id = uuid()
        await clients.first.socket.send({
          request: id,
          type: 'messages.feedback',
          data: { messageId: clients.second.messageId, feedback: -1 }
        })
        await shouldThrow(
          async () => waitForResponse(clients.first.socket, id),
          (err) => expect(err).toEqual('Conversation does not exist')
        )
      })
    })
  })
})
