import crypto from 'crypto'
import { validate as validateUuid } from 'uuid'
import { ClientService } from '../../src/clients/service'
import { Client } from '../../src/clients/types'
import { Provider } from '../../src/providers/types'
import { app, setupApp } from './utils'

describe('Clients', () => {
  let clients: ClientService
  let querySpy: jest.SpyInstance
  let state: { provider: Provider; token?: string; client?: Client }

  beforeAll(async () => {
    await setupApp()
    clients = app.clients
    querySpy = jest.spyOn(clients as any, 'query')

    state = {
      provider: await app.providers.create(crypto.randomBytes(20).toString('hex'), false)
    }
  })

  afterAll(async () => {
    await app.destroy()
  })

  beforeEach(async () => {
    app.caching.resetAll()
  })

  test('Create client', async () => {
    const client = await clients.create(state.provider.id, state.token!)

    expect(client).toBeDefined()
    expect(validateUuid(client.id)).toBeTruthy()
    expect(client.providerId).toBe(state.provider.id)

    state.client = client
  })

  test('Get client by id', async () => {
    const client = await clients.getById(state.client!.id)
    expect(client).toEqual(state.client)
    expect(querySpy).toHaveBeenCalledTimes(1)
  })

  test('Get client by id cached', async () => {
    const client = await clients.getById(state.client!.id)
    expect(client).toEqual(state.client)
    expect(querySpy).toHaveBeenCalledTimes(1)

    for (let i = 0; i < 10; i++) {
      const cached = await clients.getById(state.client!.id)
      expect(cached).toEqual(state.client)
    }

    expect(querySpy).toHaveBeenCalledTimes(1)
  })

  test('Get client by provider id', async () => {
    const client = await clients.getByProviderId(state.provider.id)
    expect(client).toEqual(state.client)
    expect(querySpy).toHaveBeenCalledTimes(1)
  })

  test('Get client by provider id cached', async () => {
    const client = await clients.getByProviderId(state.provider.id)
    expect(client).toEqual(state.client)
    expect(querySpy).toHaveBeenCalledTimes(1)

    for (let i = 0; i < 10; i++) {
      const cached = await clients.getByProviderId(state.provider.id)
      expect(cached).toEqual(state.client)
    }

    expect(querySpy).toHaveBeenCalledTimes(1)
  })
})
