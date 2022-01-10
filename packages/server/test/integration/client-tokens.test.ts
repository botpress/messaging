import { validate as validateUuid } from 'uuid'
import { ClientTokenService } from '../../src/client-tokens/service'
import { ClientToken } from '../../src/client-tokens/types'
import { Client } from '../../src/clients/types'
import { Provider } from '../../src/providers/types'
import { app, randStr, setupApp } from './utils'

describe('ClientTokens', () => {
  let clientTokens: ClientTokenService
  let querySpy: jest.SpyInstance
  let state: { provider: Provider; client: Client; rawToken?: string; clientToken?: ClientToken }

  beforeAll(async () => {
    // This should be reset after those tests
    process.env.ENABLE_EXPERIMENTAL_SOCKETS = '1'

    await setupApp()
    clientTokens = app.clientTokens
    querySpy = jest.spyOn(clientTokens as any, 'query')

    const provider = await app.providers.create(randStr(), false)
    const client = await app.clients.create(provider.id, await app.clients.generateToken())

    state = {
      provider,
      client
    }
  })

  afterAll(async () => {
    await app.destroy()
  })

  beforeEach(async () => {
    app.caching.resetAll()
  })

  test('Create raw client token', async () => {
    const rawToken = await clientTokens.generateToken()
    expect(rawToken).toHaveLength(88)
    state.rawToken = rawToken
  })

  test('Create client token', async () => {
    const clientToken = await app.clientTokens.create(state.client.id, state.rawToken!, undefined)

    expect(clientToken).toBeDefined()
    expect(validateUuid(clientToken.id)).toBeTruthy()
    expect(clientToken.clientId).toBe(state.client.id)
    // the token stored is the hash of the token
    expect(clientToken.token).not.toBe(state.rawToken)
    expect(clientToken.expiry).toBeUndefined()

    state.clientToken = clientToken
  })

  test('Get client token by id', async () => {
    const clientToken = await app.clientTokens.fetchById(state.clientToken!.id)
    expect(clientToken).toEqual(state.clientToken)
    expect(querySpy).toHaveBeenCalledTimes(1)
  })

  test('Get client token by id cached', async () => {
    const clientToken = await app.clientTokens.fetchById(state.clientToken!.id)
    expect(clientToken).toEqual(state.clientToken)
    expect(querySpy).toHaveBeenCalledTimes(1)

    for (let i = 0; i < 10; i++) {
      const clientToken = await app.clientTokens.fetchById(state.clientToken!.id)
      expect(clientToken).toEqual(state.clientToken)
    }

    expect(querySpy).toHaveBeenCalledTimes(1)
  })

  test('Get client token by id and token', async () => {
    const clientToken = await app.clientTokens.verifyToken(state.clientToken!.id, state.rawToken!)
    expect(clientToken).toEqual(state.clientToken)
  })

  test('Get client token by id and token cached', async () => {
    const clientToken = await app.clientTokens.verifyToken(state.clientToken!.id, state.rawToken!)
    expect(clientToken).toEqual(state.clientToken)
    expect(querySpy).toHaveBeenCalledTimes(1)

    for (let i = 0; i < 10; i++) {
      const clientToken = await app.clientTokens.verifyToken(state.clientToken!.id, state.rawToken!)
      expect(clientToken).toEqual(state.clientToken)
    }

    expect(querySpy).toHaveBeenCalledTimes(1)
  })

  test('Get client token by id and wrong token should return undefined', async () => {
    const clientToken = await app.clientTokens.verifyToken(state.clientToken!.id, randStr())
    expect(clientToken).toBeUndefined()
  })

  test('Create client token with outdated expiry', async () => {
    const oldDate = new Date(1982, 3, 1)
    const clientToken = await app.clientTokens.create(state.client.id, state.rawToken!, oldDate)

    expect(clientToken).toBeDefined()
    expect(validateUuid(clientToken.id)).toBeTruthy()
    expect(clientToken.clientId).toBe(state.client.id)
    // the token stored is the hash of the token
    expect(clientToken.token).not.toBe(state.rawToken)
    expect(clientToken.expiry).toEqual(oldDate)

    state.clientToken = clientToken
  })

  test('Get client token by id with outdated expiry', async () => {
    const clientToken = await app.clientTokens.fetchById(state.clientToken!.id)
    expect(clientToken).toEqual(state.clientToken)
    expect(querySpy).toHaveBeenCalledTimes(1)
  })

  test('Get client token by id with outdated expiry should return undefined', async () => {
    const clientToken = await app.clientTokens.verifyToken(state.clientToken!.id, state.rawToken!)
    expect(clientToken).toBeUndefined()
  })
})
