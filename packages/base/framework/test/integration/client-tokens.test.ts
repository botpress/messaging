import { randStr } from '@botpress/testing'
import { validate as validateUuid, v4 as uuidv4 } from 'uuid'

import { Client, ClientToken, ClientTokenService } from '../../src'
import { setupApp, destroyApp, framework } from '../utils'

describe('ClientTokens', () => {
  let clientTokens: ClientTokenService
  let querySpy: jest.SpyInstance
  let state: {
    client: Client
    client2: Client
    rawToken?: string
    rawToken2?: string
    clientToken?: ClientToken
    clientToken2?: ClientToken
  }

  beforeAll(async () => {
    await setupApp()

    clientTokens = framework.clientTokens
    querySpy = jest.spyOn(clientTokens as any, 'query')

    state = {
      client: await framework.clients.create(),
      client2: await framework.clients.create()
    }
  })

  afterAll(async () => {
    await destroyApp()
  })

  beforeEach(async () => {
    framework.caching.resetAll()
  })

  describe('GenerateToken', () => {
    test('Should be able to create a raw client token', async () => {
      const rawToken = await clientTokens.generateToken()
      expect(rawToken).toHaveLength(88)
      state.rawToken = rawToken

      {
        const rawToken = await clientTokens.generateToken()
        expect(rawToken).toHaveLength(88)
        state.rawToken2 = rawToken
      }
    })
  })

  describe('Create', () => {
    test('Should be able to create a client token', async () => {
      const clientToken = await clientTokens.create(state.client.id, state.rawToken!, undefined)

      expect(clientToken).toBeDefined()
      expect(validateUuid(clientToken.id)).toBeTruthy()
      expect(clientToken.clientId).toBe(state.client.id)
      // the token stored is the hash of the token
      expect(clientToken.token).not.toBe(state.rawToken)
      expect(clientToken.expiry).toBeUndefined()

      state.clientToken = clientToken
    })

    test('Should be able to create a client token with outdated expiry', async () => {
      const oldDate = new Date(1982, 3, 1)
      const clientToken = await clientTokens.create(state.client2.id, state.rawToken2!, oldDate)

      expect(clientToken).toBeDefined()
      expect(validateUuid(clientToken.id)).toBeTruthy()
      expect(clientToken.clientId).toBe(state.client2.id)
      // the token stored is the hash of the token
      expect(clientToken.token).not.toBe(state.rawToken2)
      expect(clientToken.expiry).toEqual(oldDate)

      state.clientToken2 = clientToken
    })
  })

  describe('FetchById', () => {
    test('Should be able to fetch a client token by id', async () => {
      const clientToken = await clientTokens.fetchById(state.clientToken!.id)
      expect(clientToken).toEqual(state.clientToken)
      expect(querySpy).toHaveBeenCalledTimes(1)
    })

    test('Should be able to fetch a cached client token by id', async () => {
      const clientToken = await clientTokens.fetchById(state.clientToken!.id)
      expect(clientToken).toEqual(state.clientToken)
      expect(querySpy).toHaveBeenCalledTimes(1)

      for (let i = 0; i < 10; i++) {
        const clientToken = await clientTokens.fetchById(state.clientToken!.id)
        expect(clientToken).toEqual(state.clientToken)
      }

      expect(querySpy).toHaveBeenCalledTimes(1)
    })

    test('Should be able to fetch a client token with outdated expiry', async () => {
      const clientToken = await clientTokens.fetchById(state.clientToken2!.id)
      expect(clientToken).toEqual(state.clientToken2)
      expect(querySpy).toHaveBeenCalledTimes(1)
    })

    test('Should return undefined of the client token id is invalid', async () => {
      const clientToken = await clientTokens.fetchById(uuidv4())
      expect(clientToken).toBeUndefined()
      expect(querySpy).toHaveBeenCalledTimes(1)
    })
  })

  describe('VerifyToken', () => {
    test('Should be able to verify a client token', async () => {
      const clientToken = await clientTokens.verifyToken(state.client.id, `${state.clientToken!.id}.${state.rawToken!}`)
      expect(clientToken).toEqual(state.clientToken)
    })

    test('Should be able to verify a legacy client token', async () => {
      const clientToken = await clientTokens.verifyToken(state.client.id, state.rawToken!)
      expect(clientToken).toEqual(state.clientToken)
    })

    test('Should be able to verify a cached client token', async () => {
      const clientToken = await clientTokens.verifyToken(state.client.id, `${state.clientToken!.id}.${state.rawToken!}`)
      expect(clientToken).toEqual(state.clientToken)
      expect(querySpy).toHaveBeenCalledTimes(1)

      for (let i = 0; i < 10; i++) {
        const clientToken = await clientTokens.verifyToken(
          state.client.id,
          `${state.clientToken!.id}.${state.rawToken!}`
        )
        expect(clientToken).toEqual(state.clientToken)
      }

      expect(querySpy).toHaveBeenCalledTimes(1)
    })

    test('Should be able to verify a cached legacy client token', async () => {
      const clientToken = await clientTokens.verifyToken(state.client.id, state.rawToken!)
      expect(clientToken).toEqual(state.clientToken)
      expect(querySpy).toHaveBeenCalledTimes(2)

      for (let i = 0; i < 10; i++) {
        const clientToken = await clientTokens.verifyToken(state.client.id, state.rawToken!)
        expect(clientToken).toEqual(state.clientToken)
      }

      expect(querySpy).toHaveBeenCalledTimes(2)
    })

    test('Should return undefined when verifying a client token with an invalid token', async () => {
      const clientToken = await clientTokens.verifyToken(state.client.id, `${state.clientToken!.id}.${randStr()}`)
      expect(clientToken).toBeUndefined()
    })

    test('Should return undefined when verifying a client token with an invalid token', async () => {
      // Caches the token
      await clientTokens.verifyToken(state.client.id, `${state.clientToken!.id}.${state.rawToken}`)

      const clientToken = await clientTokens.verifyToken(state.client.id, `${state.clientToken!.id}.${randStr()}`)
      expect(clientToken).toBeUndefined()
    })

    test('Should return undefined when verifying a legacy client token with an invalid token', async () => {
      const clientToken = await clientTokens.verifyToken(state.client2.id, randStr())
      expect(clientToken).toBeUndefined()
    })

    test('Should return undefined when verifying a legacy client token with an invalid clientId', async () => {
      const clientToken = await clientTokens.verifyToken(uuidv4(), state.rawToken2!)
      expect(clientToken).toBeUndefined()
    })

    test('Should return undefined when verifying a client token with an invalid client id', async () => {
      const clientToken = await clientTokens.verifyToken(randStr(), `${state.clientToken!.id}.${state.rawToken}`)
      expect(clientToken).toBeUndefined()
    })

    test('Should return undefined when verifying a legacy client token with an invalid client id', async () => {
      const clientToken = await clientTokens.verifyToken(randStr(), state.rawToken!)
      expect(clientToken).toBeUndefined()
    })

    test('Should return undefined when verifying a client token with an unknown token id', async () => {
      const clientToken = await clientTokens.verifyToken(state.client.id, `${uuidv4()}.${state.rawToken}`)
      expect(clientToken).toBeUndefined()
    })

    test('Should return undefined when verifying a client token with an invalid token id', async () => {
      const clientToken = await clientTokens.verifyToken(state.client.id, `${randStr()}.${state.rawToken}`)
      expect(clientToken).toBeUndefined()
    })

    test('Should return undefined when verifying a client token with an outdated expiry', async () => {
      const clientToken = await clientTokens.verifyToken(
        state.client2.id,
        `${state.clientToken2!.id}.${state.rawToken2}`
      )
      expect(clientToken).toBeUndefined()
    })

    test('Should return undefined when verifying a client token with too many parts', async () => {
      const clientToken = await clientTokens.verifyToken(
        state.client.id,
        `${state.clientToken!.id}.${state.rawToken}.someotherrandominvalidpart`
      )
      expect(clientToken).toBeUndefined()
    })

    test('Should return undefined when verifying the client token of another client', async () => {
      const clientToken = await clientTokens.verifyToken(
        state.client.id,
        `${state.clientToken2!.id}.${state.rawToken2}`
      )
      expect(clientToken).toBeUndefined()
    })
  })

  describe('ListByClient', () => {
    test('Should be able to list client tokens', async () => {
      const tokens = await clientTokens.listByClient(state.client.id)
      expect(tokens).toEqual([state.clientToken])
      expect(querySpy).toHaveBeenCalledTimes(1)

      {
        const tokens = await clientTokens.listByClient(state.client2.id)
        expect(tokens).toEqual([state.clientToken2])
        expect(querySpy).toHaveBeenCalledTimes(2)
      }
    })

    test('Should be able to list cached client tokens', async () => {
      const tokens = await clientTokens.listByClient(state.client.id)
      expect(tokens).toEqual([state.clientToken])
      expect(querySpy).toHaveBeenCalledTimes(1)

      for (let i = 0; i < 10; i++) {
        const tokens = await clientTokens.listByClient(state.client.id)
        expect(tokens).toEqual([state.clientToken])
      }

      expect(querySpy).toHaveBeenCalledTimes(1)
    })

    test('Should invalidate the client tokens cache upon creation', async () => {
      const clientToken3 = await clientTokens.create(state.client.id, await clientTokens.generateToken(), undefined)

      const tokens = await clientTokens.listByClient(state.client.id)
      expect(tokens).toEqual([state.clientToken, clientToken3])
    })
  })
})
