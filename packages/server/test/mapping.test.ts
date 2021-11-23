import { uuid } from '@botpress/messaging-base'
import { validate as validateUuid } from 'uuid'
import { MappingService } from '../src/mapping/service'
import { Provider } from '../src/providers/types'
import { setupApp, app } from './util/app'

export interface Mapping {
  tunnelId: uuid
  identityId: uuid
  senderId: uuid
  threadId: uuid
  userId: uuid
  conversationId: uuid
}

describe('Mapping', () => {
  let mapping: MappingService
  let clientId: uuid
  let channelId: uuid
  const state: { provider?: Provider } = {}

  beforeAll(async () => {
    await setupApp()
    mapping = app.mapping
    clientId = (await app.clients.create(undefined!, await app.clients.generateToken())).id
    channelId = app.channels.getByName('telegram').id
  })

  afterAll(async () => {
    await app.destroy()
  })

  beforeEach(async () => {
    app.caching.resetAll()
  })

  test('Mapping an endpoint', async () => {
    const map = await mapping.getMapping(clientId, channelId, {
      identity: 'botname',
      sender: 'bob',
      thread: '1234'
    })

    expect(map).toBeDefined()
    expect(validateUuid(map.tunnelId)).toBeTruthy()
    expect(validateUuid(map.identityId)).toBeTruthy()
    expect(validateUuid(map.senderId)).toBeTruthy()
    expect(validateUuid(map.threadId)).toBeTruthy()
    expect(validateUuid(map.userId)).toBeTruthy()
    expect(validateUuid(map.conversationId)).toBeTruthy()
  })
})
