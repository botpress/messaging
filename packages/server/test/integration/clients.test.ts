import { validate as validateUuid } from 'uuid'
import { ClientService } from '../../src/clients/service'
import { Client } from '../../src/clients/types'
import { app, setupApp } from '../utils'

describe('Clients', () => {
  let clients: ClientService
  let querySpy: jest.SpyInstance
  let state: { token?: string; client?: Client }

  beforeAll(async () => {
    await setupApp()
    clients = app.clients
    querySpy = jest.spyOn(clients as any, 'query')

    state = {}
  })

  afterAll(async () => {
    await app.destroy()
  })

  beforeEach(async () => {
    app.caching.resetAll()
  })

  test('Create client', async () => {
    const client = await clients.create()

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
