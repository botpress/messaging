import { Conversation, Message, MessagingClient, User, uuid } from '../src'

const FAKE_UUID = '6a15e73d-5edc-4b90-9d2b-bf8fd0a133c1'

describe('Http Client', () => {
  const state: {
    client?: MessagingClient
    clientId?: uuid
    clientToken?: string
    user?: User
    conversation?: Conversation
    message?: Message
  } = {}

  test('Create client', async () => {
    const client = new MessagingClient({
      url: 'http://localhost:3100'
    })

    state.client = client
  })

  test('Sync', async () => {
    const res = await state.client?.syncs.sync({})
    expect(res!.id).toBeDefined()
    expect(res!.token).toBeDefined()
    expect(res!.webhooks).toEqual([])

    state.clientId = res!.id
    state.clientToken = res!.token

    state.client!.authenticate(res!.id, res!.token)
  })

  test('Create user', async () => {
    const user = await state.client!.users.create()
    expect(user.clientId).toBe(state.clientId)
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
    expect(conversation.clientId).toBe(state.clientId)
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

  test('Delete message', async () => {
    const deleted = await state.client!.messages.delete(state.message!.id)
    expect(deleted).toEqual(true)
  })

  test('Delete deleted message that does not exist', async () => {
    const deleted = await state.client!.messages.delete(state.message!.id)
    expect(deleted).toEqual(false)
  })
})
