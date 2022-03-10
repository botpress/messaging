import { Conversation, User } from '@botpress/messaging-base/src'
import { validate as validateUuid } from 'uuid'
import { Client } from '../../src/clients/types'
import { ConversationService } from '../../src/conversations/service'
import { MessageService } from '../../src/messages/service'
import { UserService } from '../../src/users/service'
import { app, setupApp, sleep } from '../utils'

describe('Conversations', () => {
  let conversations: ConversationService
  let users: UserService
  let messages: MessageService
  let querySpy: jest.SpyInstance
  let state: { client: Client; user: User; conversation?: Conversation }

  beforeAll(async () => {
    await setupApp()
    conversations = app.conversations
    users = app.users
    messages = app.messages
    querySpy = jest.spyOn(conversations as any, 'query')

    const client = await app.clients.create()
    const user = await app.users.create(client.id)

    state = {
      client,
      user
    }
  })

  afterAll(async () => {
    await app.destroy()
  })

  beforeEach(async () => {
    app.caching.resetAll()
  })

  test('Create conversation', async () => {
    const conversation = await conversations.create(state.client.id, state.user.id)

    expect(conversation).toBeDefined()
    expect(validateUuid(conversation.id)).toBeTruthy()
    expect(conversation.clientId).toEqual(state.client.id)
    expect(conversation.userId).toEqual(state.user.id)
    expect(conversation.createdOn instanceof Date).toBeTruthy()

    state.conversation = conversation
  })

  test('Get conversation by id', async () => {
    const conversation = await conversations.get(state.conversation!.id)
    expect(conversation).toEqual(state.conversation)
    expect(querySpy).toHaveBeenCalledTimes(1)
  })

  test('Get conversation by id cached', async () => {
    const conversation = await conversations.get(state.conversation!.id)
    expect(conversation).toEqual(state.conversation)
    expect(querySpy).toHaveBeenCalledTimes(1)

    for (let i = 0; i < 10; i++) {
      const cached = await conversations.get(state.conversation!.id)
      expect(cached).toEqual(state.conversation)
    }

    expect(querySpy).toHaveBeenCalledTimes(1)
  })

  test('List conversations by user', async () => {
    const user = await users.create(state.client.id)
    const convo1 = await conversations.create(state.client.id, user.id)
    await sleep()
    const convo2 = await conversations.create(state.client.id, user.id)
    await sleep()
    const convo3 = await conversations.create(state.client.id, user.id)

    const otherUser = await users.create(state.client.id)
    const otherConvo = await conversations.create(state.client.id, otherUser.id)

    expect(await conversations.listByUserId(state.client.id, user.id)).toEqual([convo3, convo2, convo1])
  })

  test('List conversations by user should be ordered by most recently used', async () => {
    const user = await users.create(state.client.id)
    const convo1 = await conversations.create(state.client.id, user.id)
    await sleep()
    const convo2 = await conversations.create(state.client.id, user.id)
    await sleep()
    const convo3 = await conversations.create(state.client.id, user.id)

    const otherUser = await users.create(state.client.id)
    const otherConvo = await conversations.create(state.client.id, otherUser.id)

    // We create a message for convo 1 here, so convo 1 should be first in the list now
    await messages.create(convo1.id, user.id, {})
    expect(await conversations.listByUserId(state.client.id, user.id)).toEqual([convo1, convo3, convo2])

    // We create a message for convo 3 here, so convo 3 should be first in the list now
    await messages.create(convo3.id, user.id, {})
    expect(await conversations.listByUserId(state.client.id, user.id)).toEqual([convo3, convo1, convo2])
  })

  test('Deleting conversation clears cache and persists in changes', async () => {
    await conversations.delete(state.conversation!.id)
    const calls = querySpy.mock.calls.length

    const notCachedById = await conversations.fetch(state.conversation!.id)
    expect(notCachedById).toBeUndefined()
    expect(querySpy).toHaveBeenCalledTimes(calls + 1)
  })
})
