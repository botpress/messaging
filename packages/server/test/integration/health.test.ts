import { HealthEventType, HealthReport } from '@botpress/messaging-base'
import { Client } from '../../src/clients/types'
import { Conduit } from '../../src/conduits/types'
import { HealthService } from '../../src/health/service'
import { app, randStr, setupApp } from '../utils'

const TEST_CHANNEL = 'messenger'

describe('Health', () => {
  let health: HealthService
  let querySpy: jest.SpyInstance
  let state: { client: Client; conduit: Conduit; eventData?: any; eventData2?: any; clientHealth?: HealthReport }

  beforeAll(async () => {
    await setupApp()
    health = app.health
    querySpy = jest.spyOn(health as any, 'query')

    const provider = await app.providers.create(randStr(), false)
    const client = await app.clients.create()
    await app.provisions.create(client.id, provider.id)

    const conduit = await app.conduits.create(
      provider.id,
      app.channels.getByNameAndVersion(TEST_CHANNEL, '1.0.0').meta.id,
      {
        appId: randStr(),
        pageId: randStr(),
        accessToken: randStr(),
        appSecret: randStr(),
        verifyToken: randStr()
      }
    )
    await app.instances.lifetimes.stop(conduit.id)

    state = {
      client,
      conduit
    }
  })

  afterAll(async () => {
    await app.destroy()
  })

  beforeEach(async () => {
    app.caching.resetAll()
  })

  test('Register health event', async () => {
    const data = { val: randStr() }
    await health.register(state.conduit.id, HealthEventType.Sleep, data)

    state.eventData = data
  })

  test('List health for conduit returns correct data', async () => {
    const events = await health.listEventsByConduit(state.conduit.id)

    expect(events).toBeDefined()
    expect(events[0].data).toEqual(state.eventData)
  })

  test('Get health for client returns correct data', async () => {
    const clientHealth = await health.getHealthForClient(state.client.id)

    expect(clientHealth?.channels?.[TEST_CHANNEL]).toBeDefined()
    expect(clientHealth.channels[TEST_CHANNEL].events[0].data).toEqual(state.eventData)

    state.clientHealth = clientHealth
  })

  test('Get health for client cached', async () => {
    const notCached = await health.getHealthForClient(state.client.id)
    expect(notCached).toEqual(state.clientHealth)
    expect(querySpy).toHaveBeenCalledTimes(1)

    for (let i = 0; i < 10; i++) {
      const cached = await health.getHealthForClient(state.client!.id)
      expect(cached).toEqual(state.clientHealth)
    }

    expect(querySpy).toHaveBeenCalledTimes(1)
  })

  test('Register another health event', async () => {
    const data = { val: randStr() }
    await health.register(state.conduit.id, HealthEventType.Sleep, data)

    state.eventData2 = data
  })

  test('List health for conduit returns correct data for both events', async () => {
    const events = await health.listEventsByConduit(state.conduit.id)

    expect(events).toBeDefined()
    expect(events[0].data).toEqual(state.eventData2)
    expect(events[1].data).toEqual(state.eventData)
  })

  test('Get health for client returns correct data for both events', async () => {
    const clientHealth = await health.getHealthForClient(state.client.id)

    expect(clientHealth?.channels?.[TEST_CHANNEL]).toBeDefined()
    expect(clientHealth.channels[TEST_CHANNEL].events[0].data).toEqual(state.eventData2)
    expect(clientHealth.channels[TEST_CHANNEL].events[1].data).toEqual(state.eventData)
  })
})
