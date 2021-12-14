import { Conversation, SyncRequest, SyncResult, User } from '@botpress/messaging-base'
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, Method } from 'axios'
import _ from 'lodash'
import { v4 as uuid } from 'uuid'
import froth from './mocha-froth'

const HTTP_METHODS: Method[] = ['GET', 'HEAD', 'POST', 'PUT', 'DELETE', 'PURGE', 'OPTIONS', 'LINK', 'UNLINK', 'PATCH']

const UUID_LENGTH = uuid().length
const TOKEN_LENGTH = 88

const http = (credentials?: { clientId: string; clientToken: string }) => {
  const config: AxiosRequestConfig = { baseURL: 'http://localhost:3100' }

  if (credentials) {
    config.headers = {}
    config.headers['x-bp-messaging-client-id'] = credentials.clientId
    config.headers['x-bp-messaging-client-token'] = credentials.clientToken
  }

  return axios.create(config)
}

const getUnallowedMethods = (...allowed: Method[]) => {
  return HTTP_METHODS.filter((val) => !allowed.includes(val.toUpperCase() as Method))
}

const clients = {
  first: { clientId: '', clientToken: '', userId: '', conversationId: '' },
  second: { clientId: '', clientToken: '', userId: '', conversationId: '' }
}

const shouldFail = async (func: Function, onError: (err: AxiosError) => void) => {
  try {
    await func()

    throw new Error('Function did not throw an error')
  } catch (err) {
    if (axios.isAxiosError(err)) {
      onError(err)
    } else {
      throw err
    }
  }
}

describe('API', () => {
  const sync = async (data?: SyncRequest, config?: AxiosRequestConfig) => {
    const client = http()

    const res = await client.post<SyncResult>('/api/sync', data, config)

    expect(res.data).toEqual({ id: expect.anything(), token: expect.anything(), webhooks: expect.anything() })
    expect(res.status).toEqual(200)

    return res.data
  }

  describe('Sync', () => {
    test('Should not allow any other methods than POST and OPTIONS', async () => {
      const allowed: Method[] = ['POST', 'OPTIONS']
      const unallowed = getUnallowedMethods(...allowed)
      const client = http()

      for (const method of unallowed) {
        const config: AxiosRequestConfig = { method, url: '/api/sync' }

        await shouldFail(
          async () => client.request<SyncResult>(config),
          (err) => {
            if (err.response?.data) {
              expect(err.response?.data).toEqual('Method Not Allowed')
            }
            expect(err.response?.status).toEqual(405)
          }
        )
      }

      for (const method of allowed) {
        const config: AxiosRequestConfig = { method, url: '/api/sync' }
        const res = await client.request<SyncResult>(config)

        expect(res.data).not.toBeUndefined()
        expect(res.status).toBeGreaterThanOrEqual(200)
        expect(res.status).toBeLessThan(300)
      }
    })

    test('Should allow anyone to make a sync request', async () => {
      const res = await sync()

      clients.first.clientId = res.id
      clients.first.clientToken = res.token

      {
        const res = await sync()

        clients.second.clientId = res.id
        clients.second.clientToken = res.token

        expect(res.id).not.toEqual(clients.first.clientId)
        expect(res.token).not.toEqual(clients.first.clientToken)
      }
    })

    test('Should return unauthorized if token is invalid', async () => {
      const tokens = froth(10, TOKEN_LENGTH, TOKEN_LENGTH, { none: false })

      for (const token of tokens) {
        await shouldFail(
          async () => sync({ id: clients.first.clientId, token }),
          (err) => {
            expect(err.response?.data).not.toEqual({
              id: expect.anything(),
              token: expect.anything(),
              webhooks: expect.anything()
            })
            expect(err.response?.status).toEqual(403)
          }
        )
      }
    })

    test('Should not allow the token of another clients', async () => {
      await shouldFail(
        async () => sync({ id: clients.first.clientId, token: clients.first.clientToken }),
        (err) => {
          expect(err.response?.data).not.toEqual({
            id: expect.anything(),
            token: expect.anything(),
            webhooks: expect.anything()
          })
          expect(err.response?.status).toEqual(403)
        }
      )
    })

    test('Should return unauthorized if token is empty', async () => {
      const token = undefined

      await shouldFail(
        async () => sync({ id: clients.first.clientId, token }),
        (err) => {
          expect(err.response?.data).not.toEqual({
            id: expect.anything(),
            token: expect.anything(),
            webhooks: expect.anything()
          })
          expect(err.response?.status).toEqual(403)
        }
      )
    })

    test('Should handle very long and random tokens', async () => {
      const tokens = froth(1, 250, 250, { none: false })

      for (const token of tokens) {
        await shouldFail(
          async () => sync({ id: clients.first.clientId, token }),
          (err) => {
            expect(err.response?.data).not.toEqual({
              id: expect.anything(),
              token: expect.anything(),
              webhooks: expect.anything()
            })
            expect(err.response?.status).toEqual(400)
          }
        )
      }
    })

    test('Should handle object token and clientId', async () => {
      await shouldFail(
        async () => sync({ id: [] as any, token: {} as any }),
        (err) => {
          expect(err.response?.data).not.toEqual({
            id: expect.anything(),
            token: expect.anything(),
            webhooks: expect.anything()
          })
          expect(err.response?.status).toEqual(400)
        }
      )
    })

    test('Should not allow clientId other than valid UUID', async () => {
      const ids = froth(10, UUID_LENGTH, UUID_LENGTH, { none: false })

      for (const id of ids) {
        await shouldFail(
          async () => sync({ id }),
          (err) => {
            expect(err.response?.data).not.toEqual({
              id: expect.anything(),
              token: expect.anything(),
              webhooks: expect.anything()
            })
            expect(err.response?.status).toEqual(400)
          }
        )
      }
    })

    test('Should return a new set of credentials if clientId is unknown', async () => {
      const id = uuid()

      const res = await sync({ id })
      expect(res.id).not.toEqual(id)
    })

    test('Should not be able to sync an empty channel config', async () => {
      await shouldFail(
        async () => sync({ channels: { teams: null } }),
        (err) => {
          expect(err.response?.data).not.toEqual({
            id: expect.anything(),
            token: expect.anything(),
            webhooks: expect.anything()
          })
          expect(err.response?.status).toEqual(400)
        }
      )
    })

    test('Should not be able to make sync request with an heavy payload', async () => {
      const payloadSize = 200 * 1024 * 1024 // ~200kb
      const str = 'a'.repeat(payloadSize)

      await shouldFail(
        async () => sync({ str } as any, { maxContentLength: Infinity, maxBodyLength: Infinity }),
        (err) => {
          expect(err.response?.data).not.toEqual({
            id: expect.anything(),
            token: expect.anything(),
            webhooks: expect.anything()
          })
          expect(err.response?.status).toEqual(413)
        }
      )
    })
  })

  describe('User', () => {
    const user = async (clientId?: string, clientToken?: string, config?: AxiosRequestConfig) => {
      const client = http(clientId && clientToken ? { clientId, clientToken } : undefined)

      const res = await client.post<User>('/api/users', null, config)

      expect(res.data).toEqual({ id: expect.anything(), clientId })
      expect(res.status).toEqual(201)

      return res.data
    }

    const getUser = async (clientId?: string, clientToken?: string, userId?: any, config?: AxiosRequestConfig) => {
      const client = http(clientId && clientToken ? { clientId, clientToken } : undefined)

      const res = await client.get<User>(`/api/users/${userId}`, config)

      expect(res.data).toEqual({ id: userId, clientId })
      expect(res.status).toEqual(200)

      return res.data
    }

    describe('Create', () => {
      test('Should be able to create a user with valid credentials', async () => {
        const res = await user(clients.first.clientId, clients.first.clientToken)

        expect(res.clientId).toEqual(clients.first.clientId)
        expect(res.id).toBeDefined()

        clients.first.userId = res.id

        {
          const res = await user(clients.second.clientId, clients.second.clientToken)

          expect(res.clientId).toEqual(clients.second.clientId)
          expect(res.id).toBeDefined()
          expect(res.id).not.toEqual(clients.first.userId)

          clients.second.userId = res.id
        }
      })

      test('Should not be able to create a user without being authenticated', async () => {
        await shouldFail(
          async () => user(undefined, undefined),
          (err) => {
            expect(err.response?.data).toEqual('Unauthorized')

            expect(err.response?.status).toEqual(401)
          }
        )
      })

      test('Should not be able to create a user with invalid credentials', async () => {
        const clientId = uuid()
        const clientToken = froth(1, TOKEN_LENGTH, TOKEN_LENGTH, {
          none: false,
          foreign: false,
          symbols: false,
          backslashing: false,
          quotes: false,
          whitespace: false
        })[0]

        await shouldFail(
          async () => user(clientId, clientToken),
          (err) => {
            expect(err.response?.data).toEqual('Unauthorized')

            expect(err.response?.status).toEqual(401)
          }
        )
      })

      test('Should not be able to create a user with valid clientId but invalid token', async () => {
        const frothConfig = {
          none: false,
          foreign: false,
          symbols: false,
          backslashing: false,
          quotes: false,
          whitespace: false
        }
        const clientToken = froth(1, TOKEN_LENGTH, TOKEN_LENGTH, frothConfig)[0]

        await shouldFail(
          async () => user(clients.first.clientId, clientToken),
          (err) => {
            expect(err.response?.data).toEqual('Unauthorized')

            expect(err.response?.status).toEqual(401)
          }
        )
      })
    })

    describe('Get', () => {
      test('Should not be able to get a user without being authenticated', async () => {
        await shouldFail(
          async () => getUser(undefined, undefined, '123'),
          (err) => {
            expect(err.response?.data).toEqual('Unauthorized')

            expect(err.response?.status).toEqual(401)
          }
        )
      })

      test('Should not be able to get a user that does not exists', async () => {
        const userId = uuid()

        await shouldFail(
          async () => getUser(clients.first.clientId, clients.first.clientToken, userId),
          (err) => {
            expect(err.response?.data).toEqual('Not Found')
            expect(err.response?.status).toEqual(404)
          }
        )
      })

      test('Should not be able to get the user of another client', async () => {
        await shouldFail(
          async () => getUser(clients.first.clientId, clients.first.clientToken, clients.second.userId),
          (err) => {
            expect(err.response?.data).toEqual('Not Found')
            expect(err.response?.status).toEqual(404)
          }
        )
      })
    })
  })

  describe('Conversation', () => {
    const conversation = async (
      userId: string,
      clientId?: string,
      clientToken?: string,
      config?: AxiosRequestConfig
    ) => {
      const client = http(clientId && clientToken ? { clientId, clientToken } : undefined)

      const res = await client.post<Conversation>('/api/conversations', { userId }, config)

      expect(res.data).toEqual({ id: expect.anything(), clientId, userId })
      expect(res.status).toEqual(201)

      return res.data
    }

    describe('Create', () => {
      test('Should be able to create a conversation with valid credentials', async () => {
        const res = await conversation(clients.first.userId, clients.first.clientId, clients.first.clientToken)

        expect(res.clientId).toEqual(clients.first.clientId)
        expect(res.id).toBeDefined()

        clients.first.conversationId = res.id

        {
          const res = await conversation(clients.second.userId, clients.second.clientId, clients.second.clientToken)

          expect(res.clientId).toEqual(clients.second.clientId)
          expect(res.id).toBeDefined()
          expect(res.id).not.toEqual(clients.first.conversationId)

          clients.second.conversationId = res.id
        }
      })

      test('Should not be able to create a conversation without being authenticated', async () => {
        await shouldFail(
          async () => conversation(clients.first.userId, undefined, undefined),
          (err) => {
            expect(err.response?.data).toEqual('Unauthorized')

            expect(err.response?.status).toEqual(401)
          }
        )
      })

      test('Should not be able to create a conversation with invalid credentials', async () => {
        const clientId = uuid()
        const clientToken = froth(1, TOKEN_LENGTH, TOKEN_LENGTH, {
          none: false,
          foreign: false,
          symbols: false,
          backslashing: false,
          quotes: false,
          whitespace: false
        })[0]

        await shouldFail(
          async () => conversation(clients.first.userId, clientId, clientToken),
          (err) => {
            expect(err.response?.data).toEqual('Unauthorized')

            expect(err.response?.status).toEqual(401)
          }
        )
      })
    })
  })
})
