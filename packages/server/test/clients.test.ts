import crypto from 'crypto'
import { validate as validateUuid } from 'uuid'
import { ClientService } from '../src/clients/service'
import { Client } from '../src/clients/types'
import { Provider } from '../src/providers/types'
import { setupApp, app } from './util/app'

describe('Clients', () => {
  let clients: ClientService
  let querySpy: jest.SpyInstance
  let state: { provider: Provider; token?: string; client?: Client }

  beforeAll(async () => {
    await setupApp()
    clients = app.clients
    querySpy = jest.spyOn(clients, 'query')

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

  test('Create client token', async () => {
    const token = await clients.generateToken()
    expect(token).toHaveLength(88)
    state.token = token
  })

  test('Create client', async () => {
    const client = await clients.create(state.provider.id, state.token!)

    expect(client).toBeDefined()
    expect(validateUuid(client.id)).toBeTruthy()
    expect(client.providerId).toBe(state.provider.id)
    // the token stored is the hash of the token
    expect(client.token).not.toBe(state.token)

    state.client = client
  })
})
