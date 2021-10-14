import { User } from '@botpress/messaging-base'
import crypto from 'crypto'
import { validate as validateUuid } from 'uuid'
import { Client } from '../src/clients/types'
import { Provider } from '../src/providers/types'
import { UserTokenService } from '../src/user-tokens/service'
import { UserToken } from '../src/user-tokens/types'
import { setupApp, app } from './util/app'

describe('UserTokens', () => {
  let userTokens: UserTokenService
  let state: { provider: Provider; client: Client; user: User; rawToken?: string; userToken?: UserToken }

  beforeAll(async () => {
    await setupApp()
    userTokens = app.userTokens

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
    const userToken = await app.userTokens.create(state.user.id, state.rawToken!)

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
  })

  test('Get user token by id and token', async () => {
    const userToken = await app.userTokens.getByIdAndToken(state.userToken!.id, state.rawToken!)
    expect(userToken).toEqual(state.userToken)
  })

  test('Get user token by id and wrong token should return undefined', async () => {
    const userToken = await app.userTokens.getByIdAndToken(state.userToken!.id, state.rawToken!)
    expect(userToken).toEqual(state.userToken)
  })
})
