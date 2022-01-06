import { Conversation, User } from '@botpress/messaging-base/src'
import { validate as validateUuid } from 'uuid'
import { Client } from '../../src/clients/types'
import { ConversationService } from '../../src/conversations/service'
import { app, randStr, setupApp } from './utils'

describe('Conversations', () => {
  let conversations: ConversationService
  let querySpy: jest.SpyInstance
  let state: { client: Client; user: User; conversation?: Conversation }

  beforeAll(async () => {
    await setupApp()
    conversations = app.conversations
    querySpy = jest.spyOn(conversations as any, 'query')

    const provider = await app.providers.create(randStr(), false)
    const client = await app.clients.create(provider.id, await app.clients.generateToken())
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
})
