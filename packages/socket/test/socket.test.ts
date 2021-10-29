import { Conversation, Message, MessagingSocket } from '../src'

// TODO: improve this test to be more automated. Right now it requires starting
// a messaging server on port 3100 and pasting an existing client id in the CLIENT_ID variable.

const CLIENT_ID = '475dc210-0beb-4696-815f-2441b745fa4c'

describe('Socket Client', () => {
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

    expect(conversations).toEqual([state.conversation, state.conversation2])
  })

  test('Disconnect', async () => {
    await state.socket!.disconnect()
  })
})
