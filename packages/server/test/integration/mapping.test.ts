import { uuid } from '@botpress/messaging-base'
import { Endpoint } from '@botpress/messaging-channels'
import { validate as validateUuid } from 'uuid'
import { MappingService } from '../../src/mapping/service'
import { Provider } from '../../src/providers/types'
import { app, randStr, setupApp } from '../utils'

export interface Mapping {
  tunnelId: uuid
  identityId: uuid
  senderId: uuid
  threadId: uuid
  userId: uuid
  conversationId: uuid
}

const generateEndpoint = (args?: { identity?: string; sender?: string; thread?: string }) => {
  return {
    identity: args?.identity || randStr(),
    sender: args?.sender || randStr(),
    thread: args?.thread || randStr()
  }
}

describe('Mapping', () => {
  let mapping: MappingService
  let clientId: uuid
  let channelId: uuid
  let channelId2: uuid
  let customChannelName: string
  let customChannelName2: string
  const state: { provider?: Provider; endpoint?: Endpoint; mapping?: Mapping } = {}

  beforeAll(async () => {
    await setupApp()
    mapping = app.mapping
    clientId = (await app.clients.create()).id
    channelId = app.channels.getByNameAndVersion('telegram', '1.0.0').meta.id
    channelId2 = app.channels.getByNameAndVersion('twilio', '1.0.0').meta.id
    customChannelName = randStr()
    customChannelName2 = randStr()
  })

  afterAll(async () => {
    await app.destroy()
  })

  beforeEach(async () => {
    app.caching.resetAll()
  })

  test('Mapping an endpoint', async () => {
    state.endpoint = generateEndpoint()
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

  test('Mapping a completely different endpoint returns a completely different mapping', async () => {
    const endpoint = generateEndpoint()
    const map = await mapping.getMapping(clientId, channelId2, endpoint)

    expect(map.tunnelId).not.toBe(state.mapping!.tunnelId)
    expect(map.identityId).not.toBe(state.mapping!.identityId)
    expect(map.senderId).not.toBe(state.mapping!.senderId)
    expect(map.threadId).not.toBe(state.mapping!.threadId)
    expect(map.userId).not.toBe(state.mapping!.userId)
    expect(map.conversationId).not.toBe(state.mapping!.conversationId)
  })

  test('Mapping an endpoint with the same channel returns only the same tunnel', async () => {
    const endpoint = generateEndpoint()
    const map = await mapping.getMapping(clientId, channelId, endpoint)

    expect(map.tunnelId).toBe(state.mapping!.tunnelId)

    expect(map.identityId).not.toBe(state.mapping!.identityId)
    expect(map.senderId).not.toBe(state.mapping!.senderId)
    expect(map.threadId).not.toBe(state.mapping!.threadId)
    expect(map.userId).not.toBe(state.mapping!.userId)
    expect(map.conversationId).not.toBe(state.mapping!.conversationId)
  })

  test('Mapping an endpoint with the same channel and identity returns only the same tunnel and identity', async () => {
    const endpoint = generateEndpoint({ identity: state.endpoint!.identity })
    const map = await mapping.getMapping(clientId, channelId, endpoint)

    expect(map.tunnelId).toBe(state.mapping!.tunnelId)
    expect(map.identityId).toBe(state.mapping!.identityId)

    expect(map.senderId).not.toBe(state.mapping!.senderId)
    expect(map.threadId).not.toBe(state.mapping!.threadId)
    expect(map.userId).not.toBe(state.mapping!.userId)
    expect(map.conversationId).not.toBe(state.mapping!.conversationId)
  })

  test('Mapping an endpoint with the same channel, identity and sender returns only the same tunnel, identity, senderId and userId', async () => {
    const endpoint = generateEndpoint({ identity: state.endpoint!.identity, sender: state.endpoint!.sender })
    const map = await mapping.getMapping(clientId, channelId, endpoint)

    expect(map.tunnelId).toBe(state.mapping!.tunnelId)
    expect(map.identityId).toBe(state.mapping!.identityId)
    expect(map.senderId).toBe(state.mapping!.senderId)
    expect(map.userId).toBe(state.mapping!.userId)

    expect(map.threadId).not.toBe(state.mapping!.threadId)
    expect(map.conversationId).not.toBe(state.mapping!.conversationId)
  })

  test('Mapping an endpoint with only the same identity returns a completely different mapping', async () => {
    const endpoint = generateEndpoint({ identity: state.endpoint!.identity })
    const map = await mapping.getMapping(clientId, channelId2, endpoint)

    expect(map.tunnelId).not.toBe(state.mapping!.tunnelId)
    expect(map.identityId).not.toBe(state.mapping!.identityId)
    expect(map.senderId).not.toBe(state.mapping!.senderId)
    expect(map.threadId).not.toBe(state.mapping!.threadId)
    expect(map.userId).not.toBe(state.mapping!.userId)
    expect(map.conversationId).not.toBe(state.mapping!.conversationId)
  })

  test('Mapping an endpoint with only the same channel and sender returns a completely different mapping', async () => {
    const endpoint = generateEndpoint({ sender: state.endpoint!.sender })
    const map = await mapping.getMapping(clientId, channelId, endpoint)

    expect(map.tunnelId).toBe(state.mapping!.tunnelId)

    expect(map.identityId).not.toBe(state.mapping!.identityId)
    expect(map.senderId).not.toBe(state.mapping!.senderId)
    expect(map.threadId).not.toBe(state.mapping!.threadId)
    expect(map.userId).not.toBe(state.mapping!.userId)
    expect(map.conversationId).not.toBe(state.mapping!.conversationId)
  })

  test('Mapping an endpoint with only the same channel and thread returns a completely different mapping', async () => {
    const endpoint = generateEndpoint({ thread: state.endpoint!.thread })
    const map = await mapping.getMapping(clientId, channelId, endpoint)

    expect(map.tunnelId).toBe(state.mapping!.tunnelId)

    expect(map.identityId).not.toBe(state.mapping!.identityId)
    expect(map.senderId).not.toBe(state.mapping!.senderId)
    expect(map.threadId).not.toBe(state.mapping!.threadId)
    expect(map.userId).not.toBe(state.mapping!.userId)
    expect(map.conversationId).not.toBe(state.mapping!.conversationId)
  })

  test('Mapping an endpoint with the same channel, identity and thread does not return the same senderId and threadId', async () => {
    const endpoint = generateEndpoint({ identity: state.endpoint!.identity, thread: state.endpoint!.thread })
    const map = await mapping.getMapping(clientId, channelId, endpoint)

    expect(map.tunnelId).toBe(state.mapping!.tunnelId)
    expect(map.identityId).toBe(state.mapping!.identityId)

    expect(map.senderId).not.toBe(state.mapping!.senderId)
    expect(map.threadId).not.toBe(state.mapping!.threadId)
    expect(map.userId).not.toBe(state.mapping!.userId)
    expect(map.conversationId).not.toBe(state.mapping!.conversationId)
  })

  test('Get endpoint from threadId', async () => {
    const endpoint = await mapping.getEndpoint(state.mapping!.threadId!)
    expect(endpoint).toEqual(state.endpoint)
  })

  test('Mapping repeatedly does not produce race conditions', async () => {
    const endpoint = generateEndpoint()
    const promises: Promise<Mapping>[] = []

    for (let i = 0; i < 100; i++) {
      promises.push(mapping.getMapping(clientId, channelId, endpoint))
    }

    const mappings = await Promise.all(promises)

    // they should have all mapped to the same thing
    for (const mapping of mappings) {
      expect(mapping).toEqual(mappings[0])
    }
  })

  describe('Custom', () => {
    test('Mapping an endpoint', async () => {
      state.endpoint = generateEndpoint()
      const map = await mapping.getCustomMapping(clientId, customChannelName, state.endpoint)

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
      const map = await mapping.getCustomMapping(clientId, customChannelName, state.endpoint!)

      expect(map).toEqual(state.mapping)
    })

    test('Mapping a completely different endpoint returns a completely different mapping', async () => {
      const endpoint = generateEndpoint()
      const map = await mapping.getCustomMapping(clientId, customChannelName2, endpoint)

      expect(map.tunnelId).not.toBe(state.mapping!.tunnelId)
      expect(map.identityId).not.toBe(state.mapping!.identityId)
      expect(map.senderId).not.toBe(state.mapping!.senderId)
      expect(map.threadId).not.toBe(state.mapping!.threadId)
      expect(map.userId).not.toBe(state.mapping!.userId)
      expect(map.conversationId).not.toBe(state.mapping!.conversationId)
    })

    test('Mapping an endpoint with the same channel returns only the same tunnel', async () => {
      const endpoint = generateEndpoint()
      const map = await mapping.getCustomMapping(clientId, customChannelName, endpoint)

      expect(map.tunnelId).toBe(state.mapping!.tunnelId)

      expect(map.identityId).not.toBe(state.mapping!.identityId)
      expect(map.senderId).not.toBe(state.mapping!.senderId)
      expect(map.threadId).not.toBe(state.mapping!.threadId)
      expect(map.userId).not.toBe(state.mapping!.userId)
      expect(map.conversationId).not.toBe(state.mapping!.conversationId)
    })

    test('Mapping an endpoint with the same channel and identity returns only the same tunnel and identity', async () => {
      const endpoint = generateEndpoint({ identity: state.endpoint!.identity })
      const map = await mapping.getCustomMapping(clientId, customChannelName, endpoint)

      expect(map.tunnelId).toBe(state.mapping!.tunnelId)
      expect(map.identityId).toBe(state.mapping!.identityId)

      expect(map.senderId).not.toBe(state.mapping!.senderId)
      expect(map.threadId).not.toBe(state.mapping!.threadId)
      expect(map.userId).not.toBe(state.mapping!.userId)
      expect(map.conversationId).not.toBe(state.mapping!.conversationId)
    })

    test('Mapping an endpoint with the same channel, identity and sender returns only the same tunnel, identity, senderId and userId', async () => {
      const endpoint = generateEndpoint({ identity: state.endpoint!.identity, sender: state.endpoint!.sender })
      const map = await mapping.getCustomMapping(clientId, customChannelName, endpoint)

      expect(map.tunnelId).toBe(state.mapping!.tunnelId)
      expect(map.identityId).toBe(state.mapping!.identityId)
      expect(map.senderId).toBe(state.mapping!.senderId)
      expect(map.userId).toBe(state.mapping!.userId)

      expect(map.threadId).not.toBe(state.mapping!.threadId)
      expect(map.conversationId).not.toBe(state.mapping!.conversationId)
    })

    test('Mapping an endpoint with only the same identity returns a completely different mapping', async () => {
      const endpoint = generateEndpoint({ identity: state.endpoint!.identity })
      const map = await mapping.getCustomMapping(clientId, customChannelName2, endpoint)

      expect(map.tunnelId).not.toBe(state.mapping!.tunnelId)
      expect(map.identityId).not.toBe(state.mapping!.identityId)
      expect(map.senderId).not.toBe(state.mapping!.senderId)
      expect(map.threadId).not.toBe(state.mapping!.threadId)
      expect(map.userId).not.toBe(state.mapping!.userId)
      expect(map.conversationId).not.toBe(state.mapping!.conversationId)
    })

    test('Mapping an endpoint with only the same channel and sender returns a completely different mapping', async () => {
      const endpoint = generateEndpoint({ sender: state.endpoint!.sender })
      const map = await mapping.getCustomMapping(clientId, customChannelName, endpoint)

      expect(map.tunnelId).toBe(state.mapping!.tunnelId)

      expect(map.identityId).not.toBe(state.mapping!.identityId)
      expect(map.senderId).not.toBe(state.mapping!.senderId)
      expect(map.threadId).not.toBe(state.mapping!.threadId)
      expect(map.userId).not.toBe(state.mapping!.userId)
      expect(map.conversationId).not.toBe(state.mapping!.conversationId)
    })

    test('Mapping an endpoint with only the same channel and thread returns a completely different mapping', async () => {
      const endpoint = generateEndpoint({ thread: state.endpoint!.thread })
      const map = await mapping.getCustomMapping(clientId, customChannelName, endpoint)

      expect(map.tunnelId).toBe(state.mapping!.tunnelId)

      expect(map.identityId).not.toBe(state.mapping!.identityId)
      expect(map.senderId).not.toBe(state.mapping!.senderId)
      expect(map.threadId).not.toBe(state.mapping!.threadId)
      expect(map.userId).not.toBe(state.mapping!.userId)
      expect(map.conversationId).not.toBe(state.mapping!.conversationId)
    })

    test('Mapping an endpoint with the same channel, identity and thread does not return the same senderId and threadId', async () => {
      const endpoint = generateEndpoint({ identity: state.endpoint!.identity, thread: state.endpoint!.thread })
      const map = await mapping.getCustomMapping(clientId, customChannelName, endpoint)

      expect(map.tunnelId).toBe(state.mapping!.tunnelId)
      expect(map.identityId).toBe(state.mapping!.identityId)

      expect(map.senderId).not.toBe(state.mapping!.senderId)
      expect(map.threadId).not.toBe(state.mapping!.threadId)
      expect(map.userId).not.toBe(state.mapping!.userId)
      expect(map.conversationId).not.toBe(state.mapping!.conversationId)
    })

    test('Get endpoint from threadId', async () => {
      const endpoint = await mapping.getEndpoint(state.mapping!.threadId!)
      expect(endpoint).toEqual(state.endpoint)
    })

    test('Mapping repeatedly does not produce race conditions', async () => {
      const endpoint = generateEndpoint()
      const promises: Promise<Mapping>[] = []

      for (let i = 0; i < 100; i++) {
        promises.push(mapping.getCustomMapping(clientId, customChannelName, endpoint))
      }

      const mappings = await Promise.all(promises)

      // they should have all mapped to the same thing
      for (const mapping of mappings) {
        expect(mapping).toEqual(mappings[0])
      }
    })
  })
})
