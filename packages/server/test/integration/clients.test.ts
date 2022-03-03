import { Client, ClientService } from '@botpress/framework'
import crypto from 'crypto'
import { validate as validateUuid } from 'uuid'
import { Provider } from '../../src/providers/types'
import { app, setupApp } from '../utils'

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
    const client = await clients.create(state.token!)

    expect(client).toBeDefined()
    expect(validateUuid(client.id)).toBeTruthy()

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
})
