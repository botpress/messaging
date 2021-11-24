import http from 'http'
import { Conversation, Message, MessagingSocket } from '../src'

let CLIENT_ID = ''

describe('Socket Client', () => {
  beforeAll(async () => {
    const options = {
      protocol: 'http:',
      hostname: 'localhost',
      port: 3100,
      path: '/api/sync',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }

    CLIENT_ID = await new Promise((resolve, reject) => {
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
  })

  const state: {
    socket?: MessagingSocket
    userId?: string
    conversation?: Conversation
    message1?: Message
    message2?: Message
    conversation2?: Conversation
  } = {}

  test('Connect', async () => {
    const socket = new MessagingSocket({
      url: 'http://localhost:3100',
      clientId: CLIENT_ID
    })

    const promise = new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject('connection attempt timed out')
      }, 2500)

      socket.on('connect', () => {
        clearTimeout(timeout)
        resolve()
      })
    })

    await socket.connect({ autoLogin: false })
    await promise

    state.socket = socket
  })

  test('Login', async () => {
    const promise = new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject('login attempt timed out')
      }, 2500)

      state.socket!.on('login', (creds) => {
        state.userId = creds.userId
        clearTimeout(timeout)
        resolve()
      })
    })

    await state.socket!.login()
    await promise
  })

  test('CreateConversation', async () => {
    const conversation = await state.socket?.createConversation()

    expect(conversation?.clientId).toBe(CLIENT_ID)
    expect(conversation?.userId).toBe(state.userId)

    state.conversation = conversation
  })

  test('SendText', async () => {
    const message = await state.socket?.sendText('Hello!')

    expect(message?.authorId).toBe(state.userId)
    expect(message?.conversationId).toBe(state.conversation?.id)
    expect(message?.payload.text).toEqual('Hello!')

    state.message1 = message!
  })

  test('SendPayload', async () => {
    const payload = { type: 'image', image: 'blabla.jpg' }
    const message = await state.socket?.sendPayload(payload)

    expect(message?.authorId).toBe(state.userId)
    expect(message?.conversationId).toBe(state.conversation?.id)
    expect(message?.payload).toEqual(payload)

    state.message2 = message!
  })

  test('ListMessages', async () => {
    const messages = await state.socket?.listMessages()

    expect(messages).toEqual([state.message2, state.message1])
  })

  test('CreateConversation And Switch', async () => {
    const conversation = await state.socket?.createConversation()

    expect(conversation?.clientId).toBe(CLIENT_ID)
    expect(conversation?.userId).toBe(state.userId)

    expect(state.socket?.conversationId).not.toEqual(state.conversation?.id)

    state.conversation2 = conversation
  })

  test('ListConversations', async () => {
    const conversations = await state.socket?.listConversations()
    conversations?.map((x) => delete (<any>x).lastMessage)

    expect(conversations).toEqual([state.conversation2, state.conversation])
  })

  test('Disconnect', async () => {
    await state.socket!.disconnect()
  })
})
