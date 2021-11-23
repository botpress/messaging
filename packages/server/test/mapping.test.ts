import { uuid } from '@botpress/messaging-base'
import crypto from 'crypto'
import { validate as validateUuid } from 'uuid'
import { MappingService } from '../src/mapping/service'
import { Endpoint } from '../src/mapping/types'
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
  const state: { provider?: Provider; endpoint?: Endpoint; mapping?: Mapping } = {}

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
    state.endpoint = {
      identity: crypto.randomBytes(20).toString('hex'),
      sender: crypto.randomBytes(20).toString('hex'),
      thread: crypto.randomBytes(20).toString('hex')
    }

    const map = await mapping.getMapping(clientId, channelId, state.endpoint)

    expect(map).toBeDefined()
    expect(validateUuid(map.tunnelId)).toBeTruthy()
    expect(validateUuid(map.identityId)).toBeTruthy()
    expect(validateUuid(map.senderId)).toBeTruthy()
    expect(validateUuid(map.threadId)).toBeTruthy()
    expect(validateUuid(map.userId)).toBeTruthy()
    expect(validateUuid(map.conversationId)).toBeTruthy()

    state.mapping = map
  })

  test('Mapping the same endpoint again returns the same mapping', async () => {
    const map = await mapping.getMapping(clientId, channelId, state.endpoint!)

    expect(map).toEqual(state.mapping)
  })
})
