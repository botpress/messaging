import { User } from '@botpress/messaging-base'
import crypto from 'crypto'
import { validate as validateUuid } from 'uuid'
import { Client } from '../../src/clients/types'
import { Provider } from '../../src/providers/types'
import { UserTokenService } from '../../src/user-tokens/service'
import { UserToken } from '../../src/user-tokens/types'
import { app, setupApp } from './utils'

describe('UserTokens', () => {
  let userTokens: UserTokenService
  let querySpy: jest.SpyInstance
  let state: { provider: Provider; client: Client; user: User; rawToken?: string; userToken?: UserToken }

  beforeAll(async () => {
    // This should be reset after those tests
    process.env.ENABLE_EXPERIMENTAL_SOCKETS = '1'

    await setupApp()
    userTokens = app.userTokens
    querySpy = jest.spyOn(userTokens, 'query')

    const provider = await app.providers.create(crypto.randomBytes(20).toString('hex'), false)
    const client = await app.clients.create(provider.id, await app.clients.generateToken())
    const user = await app.users.create(client.id)

    state = {
      provider,
      client,
      user
    }
  })

  afterAll(async () => {
    await app.destroy()
  })

  beforeEach(async () => {
    app.caching.resetAll()
  })

  test('Create raw user token', async () => {
    const rawToken = await userTokens.generateToken()
    expect(rawToken).toHaveLength(88)
    state.rawToken = rawToken
  })

  test('Create user token', async () => {
    const userToken = await app.userTokens.create(state.user.id, state.rawToken!, undefined)

    expect(userToken).toBeDefined()
    expect(validateUuid(userToken.id)).toBeTruthy()
    expect(userToken.userId).toBe(state.user.id)
    // the token stored is the hash of the token
    expect(userToken.token).not.toBe(state.rawToken)
    expect(userToken.expiry).toBeUndefined()

    state.userToken = userToken
  })

  test('Get user token by id', async () => {
    const userToken = await app.userTokens.getById(state.userToken!.id)
    expect(userToken).toEqual(state.userToken)
    expect(querySpy).toHaveBeenCalledTimes(1)
  })

  test('Get user token by id cached', async () => {
    const userToken = await app.userTokens.getById(state.userToken!.id)
    expect(userToken).toEqual(state.userToken)
    expect(querySpy).toHaveBeenCalledTimes(1)

    for (let i = 0; i < 10; i++) {
      const userToken = await app.userTokens.getById(state.userToken!.id)
      expect(userToken).toEqual(state.userToken)
    }

    expect(querySpy).toHaveBeenCalledTimes(1)
  })

  test('Get user token by id and token', async () => {
    const userToken = await app.userTokens.verifyToken(state.userToken!.id, state.rawToken!)
    expect(userToken).toEqual(state.userToken)
  })

  test('Get user token by id and token cached', async () => {
    const userToken = await app.userTokens.verifyToken(state.userToken!.id, state.rawToken!)
    expect(userToken).toEqual(state.userToken)
    expect(querySpy).toHaveBeenCalledTimes(1)

    for (let i = 0; i < 10; i++) {
      const userToken = await app.userTokens.verifyToken(state.userToken!.id, state.rawToken!)
      expect(userToken).toEqual(state.userToken)
    }

    expect(querySpy).toHaveBeenCalledTimes(1)
  })

  test('Get user token by id and wrong token should return undefined', async () => {
    const userToken = await app.userTokens.verifyToken(state.userToken!.id, 'abc')
    expect(userToken).toBeUndefined()
  })

  test('Create user token with outdated expiry', async () => {
    const oldDate = new Date(1982, 3, 1)
    const userToken = await app.userTokens.create(state.user.id, state.rawToken!, oldDate)

    expect(userToken).toBeDefined()
    expect(validateUuid(userToken.id)).toBeTruthy()
    expect(userToken.userId).toBe(state.user.id)
    // the token stored is the hash of the token
    expect(userToken.token).not.toBe(state.rawToken)
    expect(userToken.expiry).toEqual(oldDate)

    state.userToken = userToken
  })

  test('Get user token by id with outdated expiry', async () => {
    const userToken = await app.userTokens.getById(state.userToken!.id)
    expect(userToken).toEqual(state.userToken)
    expect(querySpy).toHaveBeenCalledTimes(1)
  })

  test('Get user token by id with outdated expiry should return undefined', async () => {
    const userToken = await app.userTokens.verifyToken(state.userToken!.id, state.rawToken!)
    expect(userToken).toBeUndefined()
  })
})
