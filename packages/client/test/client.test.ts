import { Conversation, Message, MessagingClient, User } from '../src'

// TODO: improve this test to be more automated. Right now it requires starting
// a messaging server on port 3100 and pasting an existing client id in the CLIENT_ID variable.

const CLIENT_ID = '6a15e73d-5edc-4b90-9d2b-bf8fd0a133c1'
const CLIENT_TOKEN = 'KVOQeASHZCBxgUlCdxH24VevJgFCGfrJ7gMKDgoK7uDoPUd82qQU1WgApN82DfHPsGRZZUf+AAsep6VoDEZLY9KZ'

const FAKE_UUID = '6a15e73d-5edc-4b90-9d2b-bf8fd0a133c1'

describe('Http Client', () => {
  const state: {
    client?: MessagingClient
    user?: User
    conversation?: Conversation
    message?: Message
  } = {}

  test('Create client', async () => {
    const client = new MessagingClient({
      url: 'http://localhost:3100',
      auth: { clientId: CLIENT_ID, clientToken: CLIENT_TOKEN }
    })

    state.client = client
  })

  test('Create user', async () => {
    const user = await state.client!.users.create()
    expect(user.clientId).toBe(CLIENT_ID)
    expect(user.id).toBeDefined()

    state.user = user
  })

  test('Get user', async () => {
    const user = await state.client!.users.get(state.user!.id)
    expect(user).toEqual(state.user)
  })

  test('Get user that does not exist', async () => {
    const user = await state.client!.users.get(FAKE_UUID)
    expect(user).toBeUndefined()
  })

  test('Create conversation', async () => {
    const conversation = await state.client!.conversations.create(state.user!.id)
    expect(conversation.clientId).toBe(CLIENT_ID)
    expect(conversation.userId).toBe(state.user!.id)
    expect(conversation.id).toBeDefined()
    expect(conversation.createdOn).toBeDefined()

    state.conversation = conversation
  })

  test('Get conversation', async () => {
    const conversation = await state.client!.conversations.get(state.conversation!.id)
    expect(conversation).toEqual(state.conversation)
  })

  test('Get conversation that does not exist', async () => {
    const conversation = await state.client!.conversations.get(FAKE_UUID)
    expect(conversation).toBeUndefined()
  })

  test('Create message', async () => {
    const payload = {
      type: 'text',
      text: 'yoyo'
    }

    const message = await state.client!.messages.create(state.conversation!.id, state.user!.id, payload)
    expect(message.conversationId).toBe(state.conversation!.id)
    expect(message.authorId).toBe(state.user!.id)
    expect(message.id).toBeDefined()
    expect(message.sentOn).toBeDefined()
    expect(message.payload).toEqual(payload)

    state.message = message
  })

  test('Get message', async () => {
    const message = await state.client!.messages.get(state.message!.id)
    expect(message).toEqual(state.message)
  })

  test('Get message that does not exist', async () => {
    const message = await state.client!.messages.get(FAKE_UUID)
    expect(message).toBeUndefined()
  })
})
