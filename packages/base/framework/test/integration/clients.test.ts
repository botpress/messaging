import { validate as validateUuid, v4 as uuidv4 } from 'uuid'

import { Client, ClientService } from '../../src'
import { destroyApp, framework, setupApp } from '../utils'

describe('Clients', () => {
  let clients: ClientService
  let querySpy: jest.SpyInstance
  let state: { token?: string; client?: Client }

  beforeAll(async () => {
    await setupApp()

    clients = framework.clients
    querySpy = jest.spyOn(clients as any, 'query')

    state = {}
  })

  afterAll(async () => {
    await destroyApp()
  })

  beforeEach(async () => {
    framework.caching.resetAll()
  })

  test('Should be able to create a client', async () => {
    const client = await clients.create()

    expect(client).toBeDefined()
    expect(validateUuid(client.id)).toBeTruthy()

    state.client = client
  })

  test('Should be able to get a client by id', async () => {
    const client = await clients.getById(state.client!.id)
    expect(client).toEqual(state.client)
    expect(querySpy).toHaveBeenCalledTimes(1)
  })

  test('Should be able to get a cached client by id', async () => {
    const client = await clients.getById(state.client!.id)
    expect(client).toEqual(state.client)
    expect(querySpy).toHaveBeenCalledTimes(1)

    for (let i = 0; i < 10; i++) {
      const cached = await clients.getById(state.client!.id)
      expect(cached).toEqual(state.client)
    }

    expect(querySpy).toHaveBeenCalledTimes(1)
  })

  test('Should throw an error if the client does not exist', async () => {
    const clientId = uuidv4()
    await expect(clients.getById(clientId)).rejects.toThrow(`Client ${clientId} not found`)
    expect(querySpy).toHaveBeenCalledTimes(1)
  })
})
