import { validate as validateUuid } from 'uuid'
import { ClientTokenService } from '../../src/client-tokens/service'
import { ClientToken } from '../../src/client-tokens/types'
import { Client } from '../../src/clients/types'
import { app, randStr, setupApp } from '../utils'

describe('ClientTokens', () => {
  let clientTokens: ClientTokenService
  let querySpy: jest.SpyInstance
  let state: {
    client: Client
    rawToken?: string
    clientToken?: ClientToken
    clientToken2?: ClientToken
  }

  beforeAll(async () => {
    await setupApp()
    clientTokens = app.clientTokens
    querySpy = jest.spyOn(clientTokens as any, 'query')

    state = {
      client: await app.clients.create()
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
    const clientToken = await clientTokens.create(state.client.id, state.rawToken!, undefined)

    expect(clientToken).toBeDefined()
    expect(validateUuid(clientToken.id)).toBeTruthy()
    expect(clientToken.clientId).toBe(state.client.id)
    // the token stored is the hash of the token
    expect(clientToken.token).not.toBe(state.rawToken)
    expect(clientToken.expiry).toBeUndefined()

    state.clientToken = clientToken
  })

  test('Get client token by id', async () => {
    const clientToken = await clientTokens.fetchById(state.clientToken!.id)
    expect(clientToken).toEqual(state.clientToken)
    expect(querySpy).toHaveBeenCalledTimes(1)
  })

  test('Get client token by id cached', async () => {
    const clientToken = await clientTokens.fetchById(state.clientToken!.id)
    expect(clientToken).toEqual(state.clientToken)
    expect(querySpy).toHaveBeenCalledTimes(1)

    for (let i = 0; i < 10; i++) {
      const clientToken = await clientTokens.fetchById(state.clientToken!.id)
      expect(clientToken).toEqual(state.clientToken)
    }

    expect(querySpy).toHaveBeenCalledTimes(1)
  })

  test('Verify client token', async () => {
    const clientToken = await clientTokens.verifyToken(state.client.id, `${state.clientToken!.id}.${state.rawToken!}`)
    expect(clientToken).toEqual(state.clientToken)
  })

  test('Verify legacy client token', async () => {
    const clientToken = await clientTokens.verifyToken(state.client.id, state.rawToken!)
    expect(clientToken).toEqual(state.clientToken)
  })

  test('Verify client token cached', async () => {
    const clientToken = await clientTokens.verifyToken(state.client.id, `${state.clientToken!.id}.${state.rawToken!}`)
    expect(clientToken).toEqual(state.clientToken)
    expect(querySpy).toHaveBeenCalledTimes(1)

    for (let i = 0; i < 10; i++) {
      const clientToken = await clientTokens.verifyToken(state.client.id, `${state.clientToken!.id}.${state.rawToken!}`)
      expect(clientToken).toEqual(state.clientToken)
    }

    expect(querySpy).toHaveBeenCalledTimes(1)
  })

  test('Verify legacy client token cached', async () => {
    const clientToken = await clientTokens.verifyToken(state.client.id, state.rawToken!)
    expect(clientToken).toEqual(state.clientToken)
    expect(querySpy).toHaveBeenCalledTimes(2)

    for (let i = 0; i < 10; i++) {
      const clientToken = await clientTokens.verifyToken(state.client.id, state.rawToken!)
      expect(clientToken).toEqual(state.clientToken)
    }

    expect(querySpy).toHaveBeenCalledTimes(2)
  })

  test('Get client token by id and wrong token should return undefined', async () => {
    const clientToken = await clientTokens.verifyToken(state.client.id, `${state.clientToken!.id}.${randStr()}`)
    expect(clientToken).toBeUndefined()
  })

  test('Get legacy client token by id and wrong token should return undefined', async () => {
    const clientToken = await clientTokens.verifyToken(state.client.id, randStr())
    expect(clientToken).toBeUndefined()
  })

  test('Get client token by id and wrong client should return undefined', async () => {
    const clientToken = await clientTokens.verifyToken(randStr(), `${state.clientToken!.id}.${state.rawToken}`)
    expect(clientToken).toBeUndefined()
  })

  test('Get legacy client token by id and wrong client should return undefined', async () => {
    const clientToken = await clientTokens.verifyToken(randStr(), state.rawToken!)
    expect(clientToken).toBeUndefined()
  })

  test('Create client token with outdated expiry', async () => {
    const oldDate = new Date(1982, 3, 1)
    const clientToken = await clientTokens.create(state.client.id, state.rawToken!, oldDate)

    expect(clientToken).toBeDefined()
    expect(validateUuid(clientToken.id)).toBeTruthy()
    expect(clientToken.clientId).toBe(state.client.id)
    // the token stored is the hash of the token
    expect(clientToken.token).not.toBe(state.rawToken)
    expect(clientToken.expiry).toEqual(oldDate)

    state.clientToken2 = clientToken
  })

  test('Get client token by id with outdated expiry', async () => {
    const clientToken = await clientTokens.fetchById(state.clientToken2!.id)
    expect(clientToken).toEqual(state.clientToken2)
    expect(querySpy).toHaveBeenCalledTimes(1)
  })

  test('Get client token by id with outdated expiry should return undefined', async () => {
    const clientToken = await clientTokens.verifyToken(state.client.id, `${state.clientToken2!.id}.${state.rawToken}`)
    expect(clientToken).toBeUndefined()
  })

  test('List client tokens', async () => {
    const tokens = await clientTokens.listByClient(state.client.id)
    expect(tokens).toEqual([state.clientToken, state.clientToken2])
    expect(querySpy).toHaveBeenCalledTimes(1)
  })

  test('List client tokens cached', async () => {
    const tokens = await clientTokens.listByClient(state.client.id)
    expect(tokens).toEqual([state.clientToken, state.clientToken2])
    expect(querySpy).toHaveBeenCalledTimes(1)

    for (let i = 0; i < 10; i++) {
      const tokens = await clientTokens.listByClient(state.client.id)
      expect(tokens).toEqual([state.clientToken, state.clientToken2])
    }

    expect(querySpy).toHaveBeenCalledTimes(1)
  })

  test('List client tokens cache is invalidated by token creation', async () => {
    const clientToken3 = await clientTokens.create(state.client.id, await clientTokens.generateToken(), undefined)

    const tokens = await clientTokens.listByClient(state.client.id)
    expect(tokens).toEqual([state.clientToken, state.clientToken2, clientToken3])
  })
})
