import { Conversation, Message, SyncRequest, SyncResult, User } from '@botpress/messaging-base'
import axios, { AxiosError, AxiosRequestConfig, Method } from 'axios'
import _ from 'lodash'
import querystring from 'querystring'
import { v4 as uuid } from 'uuid'
import froth from './mocha-froth'

const UUID_LENGTH = uuid().length
const TOKEN_LENGTH = 125
const MAX_PAYLOAD_SIZE = 100 * 1024 * 1024 // ~100kb
const FAKE_CLIENT_ID = uuid()
const FAKE_CLIENT_TOKEN = froth(TOKEN_LENGTH, TOKEN_LENGTH, {
  none: false,
  foreign: false,
  symbols: false,
  backslashing: false,
  quotes: false,
  whitespace: false
})

const http = (clientId?: string, clientToken?: string) => {
  const config: AxiosRequestConfig = { baseURL: 'http://localhost:3100' }

  if (clientId && clientToken) {
    config.headers = {}
    config.headers['x-bp-messaging-client-id'] = clientId
    config.headers['x-bp-messaging-client-token'] = clientToken
  }

  return axios.create(config)
}

const clients = {
  first: { clientId: '', clientToken: '', userId: '', conversationId: '', messageId: '' },
  second: { clientId: '', clientToken: '', userId: '', conversationId: '', messageId: '' }
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
  describe('Admin', () => {
    const createClient = async () => {
      const client = http()
      const res = await client.post('/api/admin/clients')

      expect(res.data).toEqual({ id: expect.anything(), token: expect.anything() })
      expect(res.status).toEqual(201)

      return res.data
    }

    test('Should be able to create clients', async () => {
      const res = await createClient()

      clients.first.clientId = res.id
      clients.first.clientToken = res.token

      {
        const res = await createClient()

        clients.second.clientId = res.id
        clients.second.clientToken = res.token

        expect(res.id).not.toEqual(clients.first.clientId)
        expect(res.token).not.toEqual(clients.first.clientToken)
      }
    })
  })

  describe('Sync', () => {
    const sync = async (clientId?: string, clientToken?: string, data?: any, config?: AxiosRequestConfig) => {
      const client = http(clientId, clientToken)

      const res = await client.post<SyncResult>('/api/sync', data || {}, config)

      expect(res.data).toEqual({ webhooks: expect.anything() })
      expect(res.status).toEqual(200)

      return res.data
    }

    test('Should not allow any other methods than POST and OPTIONS', async () => {
      const allowed: Method[] = ['POST', 'OPTIONS']
      const unallowed: Method[] = ['GET', 'HEAD', 'PUT', 'DELETE', 'PURGE', 'LINK', 'UNLINK', 'PATCH']
      const client = http(clients.first.clientId, clients.first.clientToken)

      for (const method of unallowed) {
        const config: AxiosRequestConfig = { method, url: '/api/sync' }
        await shouldFail(
          async () => client.request<SyncResult>(config),
          (err) => {
            expect(err.response?.status).toEqual(404)
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

    test('Should return unauthorized if token is invalid', async () => {
      const tokens = Array.from({ length: 10 }, () => froth(TOKEN_LENGTH))

      for (const token of tokens) {
        await shouldFail(
          async () => sync(clients.first.clientId, Buffer.from(token).toString('base64url')),
          (err) => {
            expect(err.response?.data).toEqual('Unauthorized')
            expect(err.response?.status).toEqual(401)
          }
        )
      }
    })

    test('Should not allow the token of another client', async () => {
      await shouldFail(
        async () => sync(clients.first.clientId, clients.second.clientToken),
        (err) => {
          expect(err.response?.data).toEqual('Unauthorized')
          expect(err.response?.status).toEqual(401)
        }
      )
    })

    test('Should return unauthorized if token is empty', async () => {
      await shouldFail(
        async () => sync(clients.first.clientId, ''),
        (err) => {
          expect(err.response?.data).toEqual('Unauthorized')
          expect(err.response?.status).toEqual(401)
        }
      )
    })

    test('Should return unauthorized if token is undefined', async () => {
      await shouldFail(
        async () => sync(clients.first.clientId, undefined),
        (err) => {
          expect(err.response?.data).toEqual('Unauthorized')
          expect(err.response?.status).toEqual(401)
        }
      )
    })

    test('Should handle very long and random tokens', async () => {
      const tokens = Array.from({ length: 10 }, () => froth(TOKEN_LENGTH + 100))

      for (const token of tokens) {
        await shouldFail(
          async () => sync(clients.first.clientId, Buffer.from(token).toString('base64url')),
          (err) => {
            expect(err.response?.data).not.toEqual({
              id: expect.anything(),
              token: expect.anything(),
              webhooks: expect.anything()
            })
            expect(err.response?.data).toEqual('Unauthorized')
            expect(err.response?.status).toEqual(401)
          }
        )
      }
    })

    test('Should handle object token and clientId', async () => {
      await shouldFail(
        async () => sync([] as any, {} as any),
        (err) => {
          expect(err.response?.data).toEqual('Unauthorized')
          expect(err.response?.status).toEqual(401)
        }
      )
    })

    test('Should not allow clientId other than valid UUID', async () => {
      const ids = Array.from({ length: 10 }, () => froth(UUID_LENGTH))

      for (const id of ids) {
        await shouldFail(
          async () => sync(id),
          (err) => {
            expect(err.response?.data).toEqual('Unauthorized')
            expect(err.response?.status).toEqual(401)
          }
        )
      }
    })

    test('Should not be able to sync an empty channel config', async () => {
      await shouldFail(
        async () => sync(clients.first.clientId, clients.first.clientToken, { channels: { teams: null } }),
        (err) => {
          expect(err.response?.data).not.toEqual({
            id: expect.anything(),
            token: expect.anything(),
            webhooks: expect.anything()
          })
          expect(err.response?.data).toEqual('"body.channels.teams" must be of type object')
          expect(err.response?.status).toEqual(400)
        }
      )
    })

    test('Should not be able to make sync request with an heavy payload', async () => {
      const str = 'a'.repeat(MAX_PAYLOAD_SIZE * 2)

      await shouldFail(
        async () =>
          sync(clients.first.clientId, clients.first.clientToken, { str } as any, {
            maxContentLength: Infinity,
            maxBodyLength: Infinity
          }),
        (err) => {
          expect(err.response?.data).toContain('PayloadTooLargeError: request entity too large')
          expect(err.response?.status).toEqual(413)
        }
      )
    })
  })

  describe('User', () => {
    const user = async (clientId?: string, clientToken?: string, config?: AxiosRequestConfig) => {
      const res = await http(clientId, clientToken).post<User>('/api/users', null, config)

      expect(res.data).toEqual({ id: expect.anything(), clientId })
      expect(res.status).toEqual(201)

      return res.data
    }

    const getUser = async (userId: string, clientId?: string, clientToken?: string, config?: AxiosRequestConfig) => {
      const res = await http(clientId, clientToken).get<User>(`/api/users/${userId}`, config)

      expect(res.data).toEqual({ id: userId, clientId })
      expect(res.status).toEqual(200)

      return res.data
    }

    describe('Create', () => {
      test('Should be able to create a user with valid credentials', async () => {
        const res = await user(clients.first.clientId, clients.first.clientToken)

        clients.first.userId = res.id

        {
          const res = await user(clients.second.clientId, clients.second.clientToken)

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
        await shouldFail(
          async () => user(FAKE_CLIENT_ID, FAKE_CLIENT_TOKEN),
          (err) => {
            expect(err.response?.data).toEqual('Unauthorized')
            expect(err.response?.status).toEqual(401)
          }
        )
      })

      test('Should not be able to create a user with valid clientId but invalid token', async () => {
        await shouldFail(
          async () => user(clients.first.clientId, FAKE_CLIENT_TOKEN),
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
          async () => getUser(clients.first.userId),
          (err) => {
            expect(err.response?.data).toEqual('Unauthorized')
            expect(err.response?.status).toEqual(401)
          }
        )
      })

      test('Should not be able to get a user that does not exists', async () => {
        await shouldFail(
          async () => getUser(uuid(), clients.first.clientId, clients.first.clientToken),
          (err) => {
            expect(err.response?.data).toEqual('Not Found')
            expect(err.response?.status).toEqual(404)
          }
        )
      })

      test('Should not be able to get the user of another client', async () => {
        await shouldFail(
          async () => getUser(clients.second.userId, clients.first.clientId, clients.first.clientToken),
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
      const res = await http(clientId, clientToken).post<Conversation>('/api/conversations', { userId }, config)

      expect(res.data).toEqual({ id: expect.anything(), clientId, userId, createdOn: expect.anything() })
      expect(res.status).toEqual(201)

      return res.data
    }

    const getConversation = async (
      conversationId: string,
      userId?: string,
      clientId?: string,
      clientToken?: string,
      config?: AxiosRequestConfig
    ) => {
      const res = await http(clientId, clientToken).get<Conversation>(`/api/conversations/${conversationId}`, config)

      expect(res.data).toEqual({ id: expect.anything(), clientId, userId, createdOn: expect.anything() })
      expect(res.status).toEqual(200)

      return res.data
    }

    const listConversations = async (
      conversationId: string,
      userId: string,
      limit?: number,
      clientId?: string,
      clientToken?: string,
      config?: AxiosRequestConfig
    ) => {
      const query = limit ? `?limit=${limit}` : ''
      const res = await http(clientId, clientToken).get<Conversation[]>(
        `/api/conversations/user/${userId}${query}`,
        config
      )

      expect(res.data[0]).toEqual({ id: conversationId, clientId, userId, createdOn: expect.anything() })
      expect(res.status).toEqual(200)

      return res.data
    }

    describe('Create', () => {
      test('Should be able to create a conversation with valid credentials', async () => {
        const res = await conversation(clients.first.userId, clients.first.clientId, clients.first.clientToken)

        clients.first.conversationId = res.id

        {
          const res = await conversation(clients.second.userId, clients.second.clientId, clients.second.clientToken)

          expect(res.id).not.toEqual(clients.first.conversationId)

          clients.second.conversationId = res.id
        }
      })

      test('Should not be able to create a conversation without being authenticated', async () => {
        await shouldFail(
          async () => conversation(clients.first.userId),
          (err) => {
            expect(err.response?.data).toEqual('Unauthorized')

            expect(err.response?.status).toEqual(401)
          }
        )
      })

      test('Should not be able to create a conversation with invalid credentials', async () => {
        await shouldFail(
          async () => conversation(clients.first.userId, FAKE_CLIENT_ID, FAKE_CLIENT_TOKEN),
          (err) => {
            expect(err.response?.data).toEqual('Unauthorized')

            expect(err.response?.status).toEqual(401)
          }
        )
      })
    })

    describe('Get', () => {
      test('Should be able to get a conversation with valid credentials', async () => {
        await getConversation(
          clients.first.conversationId,
          clients.first.userId,
          clients.first.clientId,
          clients.first.clientToken
        )

        await getConversation(
          clients.second.conversationId,
          clients.second.userId,
          clients.second.clientId,
          clients.second.clientToken
        )
      })

      test('Should not be able to get a conversation without being authenticated', async () => {
        await shouldFail(
          async () => getConversation(clients.first.conversationId),
          (err) => {
            expect(err.response?.data).toEqual('Unauthorized')

            expect(err.response?.status).toEqual(401)
          }
        )
      })

      test('Should not be able to get a conversation that does not exists', async () => {
        await shouldFail(
          async () => getConversation(uuid(), clients.first.userId, clients.first.clientId, clients.first.clientToken),
          (err) => {
            expect(err.response?.data).toEqual('Not Found')

            expect(err.response?.status).toEqual(404)
          }
        )
      })

      test('Should not be able to get the conversation of another client', async () => {
        await shouldFail(
          async () =>
            getConversation(
              clients.second.conversationId,
              clients.second.userId,
              clients.first.clientId,
              clients.first.clientToken
            ),
          (err) => {
            expect(err.response?.data).toEqual('Not Found')

            expect(err.response?.status).toEqual(404)
          }
        )
      })
    })

    describe('List', () => {
      test('Should be able to list conversations with valid credentials', async () => {
        await listConversations(
          clients.first.conversationId,
          clients.first.userId,
          1,
          clients.first.clientId,
          clients.first.clientToken
        )
        await listConversations(
          clients.second.conversationId,
          clients.second.userId,
          1,
          clients.second.clientId,
          clients.second.clientToken
        )
      })

      test('Should not be able to list conversations without being authenticated', async () => {
        await shouldFail(
          async () => listConversations(clients.first.conversationId, clients.first.userId),
          (err) => {
            expect(err.response?.data).toEqual('Unauthorized')
            expect(err.response?.status).toEqual(401)
          }
        )
      })

      test('Should not be able to list conversations for a user that does not exists', async () => {
        await shouldFail(
          async () =>
            listConversations(
              clients.first.conversationId,
              uuid(),
              1,
              clients.first.clientId,
              clients.first.clientToken
            ),
          (err) => {
            expect(err.response?.data).toEqual('Not Found')
            expect(err.response?.status).toEqual(404)
          }
        )
      })

      test('Should not be able to list the conversations of a user from another client', async () => {
        await shouldFail(
          async () =>
            listConversations(
              clients.second.conversationId,
              clients.second.userId,
              1,
              clients.first.clientId,
              clients.first.clientToken
            ),
          (err) => {
            expect(err.response?.data).toEqual('Not Found')
            expect(err.response?.status).toEqual(404)
          }
        )
      })

      test('Should not allow to list conversations with an invalid limit', async () => {
        await shouldFail(
          async () =>
            listConversations(
              clients.first.conversationId,
              clients.first.userId,
              Number.MAX_SAFE_INTEGER + 1,
              clients.first.clientId,
              clients.first.clientToken
            ),
          (err) => {
            expect(err.response?.data).toEqual('"query.limit" must be a safe number')
            expect(err.response?.status).toEqual(400)
          }
        )
      })
    })
  })

  describe('Message', () => {
    const message = async (
      conversationId: string,
      authorId: string,
      payload: any,
      incomingId?: string,
      clientId?: string,
      clientToken?: string,
      config?: AxiosRequestConfig
    ) => {
      const res = await http(clientId, clientToken).post<Message>(
        '/api/messages',
        { conversationId, authorId, payload, incomingId },
        config
      )

      expect(res.data).toEqual({ id: expect.anything(), conversationId, authorId, payload, sentOn: expect.anything() })
      expect(res.status).toEqual(201)

      return res.data
    }

    const getMessage = async (
      messageId: string,
      conversationId: string,
      authorId: string,
      clientId?: string,
      clientToken?: string,
      config?: AxiosRequestConfig
    ) => {
      const res = await http(clientId, clientToken).get<Message>(`/api/messages/${messageId}`, config)

      expect(res.data).toEqual({
        id: messageId,
        conversationId,
        authorId,
        payload: expect.anything(),
        sentOn: expect.anything()
      })
      expect(res.status).toEqual(200)

      return res.data
    }

    const listMessages = async (
      messageId: string,
      conversationId: string,
      authorId: string,
      limit?: number,
      clientId?: string,
      clientToken?: string,
      config?: AxiosRequestConfig
    ) => {
      const query = limit ? `?limit=${limit}` : ''
      const res = await http(clientId, clientToken).get<Message[]>(
        `/api/messages/conversation/${conversationId}${query}`,
        config
      )

      expect(res.data[0]).toEqual({
        id: messageId,
        conversationId,
        authorId,
        payload: expect.anything(),
        sentOn: expect.anything()
      })
      expect(res.status).toEqual(200)

      return res.data
    }

    const deleteMessage = async (
      messageId: string,
      clientId?: string,
      clientToken?: string,
      config?: AxiosRequestConfig
    ) => {
      const res = await http(clientId, clientToken).get<void>(`/api/messages/${messageId}`, config)

      expect(res.data).toBeUndefined()
      expect(res.status).toEqual(204)
    }

    const deleteMessagesByConversation = async (
      conversationId: string,
      clientId?: string,
      clientToken?: string,
      config?: AxiosRequestConfig
    ) => {
      const res = await http(clientId, clientToken).get<void>(`/api/messages/conversation/${conversationId}`, config)

      expect(res.data).toEqual({ count: 1 })
      expect(res.status).toEqual(200)
    }

    describe('Create', () => {
      test('Should be able to create a message with valid credentials', async () => {
        const res = await message(
          clients.first.conversationId,
          clients.first.userId,
          { [froth(1000)]: froth(1000), [froth(1000)]: froth(1000) },
          undefined,
          clients.first.clientId,
          clients.first.clientToken
        )

        clients.first.messageId = res.id

        {
          const res = await message(
            clients.second.conversationId,
            clients.second.userId,
            {},
            undefined,
            clients.second.clientId,
            clients.second.clientToken
          )

          expect(res.id).not.toEqual(clients.first.messageId)

          clients.second.messageId = res.id
        }
      })

      test('Should not be able to create a message with an invalid payload', async () => {
        await shouldFail(
          async () =>
            message(
              clients.first.conversationId,
              clients.first.userId,
              true,
              undefined,
              clients.first.clientId,
              clients.first.clientToken
            ),
          (err) => {
            expect(err.response?.data).toEqual('"body.payload" must be of type object')
            expect(err.response?.status).toEqual(400)
          }
        )

        await shouldFail(
          async () =>
            message(
              clients.first.conversationId,
              clients.first.userId,
              '{true}',
              undefined,
              clients.first.clientId,
              clients.first.clientToken
            ),
          (err) => {
            expect(err.response?.data).toEqual('"body.payload" must be of type object')
            expect(err.response?.status).toEqual(400)
          }
        )
      })

      test('Should not be able to create a message without being authenticated', async () => {
        await shouldFail(
          async () => message(clients.first.conversationId, clients.first.userId, {}),
          (err) => {
            expect(err.response?.data).toEqual('Unauthorized')
            expect(err.response?.status).toEqual(401)
          }
        )
      })

      test('Should not be able to create a message with invalid credentials', async () => {
        await shouldFail(
          async () =>
            message(
              clients.first.conversationId,
              clients.first.userId,
              {},
              undefined,
              FAKE_CLIENT_ID,
              FAKE_CLIENT_TOKEN
            ),
          (err) => {
            expect(err.response?.data).toEqual('Unauthorized')
            expect(err.response?.status).toEqual(401)
          }
        )
      })
    })

    describe('Get', () => {
      test('Should be able to get a message with valid credentials', async () => {
        await getMessage(
          clients.first.messageId,
          clients.first.conversationId,
          clients.first.userId,
          clients.first.clientId,
          clients.first.clientToken
        )

        await getMessage(
          clients.second.messageId,
          clients.second.conversationId,
          clients.second.userId,
          clients.second.clientId,
          clients.second.clientToken
        )
      })

      test('Should not be able to get a message without being authenticated', async () => {
        await shouldFail(
          async () => getMessage(clients.second.messageId, clients.second.conversationId, clients.second.userId),
          (err) => {
            expect(err.response?.data).toEqual('Unauthorized')
            expect(err.response?.status).toEqual(401)
          }
        )
      })

      test('Should not be able to get a message that does not exists', async () => {
        await shouldFail(
          async () =>
            getMessage(
              uuid(),
              clients.second.conversationId,
              clients.second.userId,
              clients.first.clientId,
              clients.first.clientToken
            ),
          (err) => {
            expect(err.response?.data).toEqual('Not Found')
            expect(err.response?.status).toEqual(404)
          }
        )
      })

      test('Should not be able to get the message of another client', async () => {
        await shouldFail(
          async () =>
            getMessage(
              clients.second.messageId,
              clients.second.conversationId,
              clients.second.userId,
              clients.first.clientId,
              clients.first.clientToken
            ),
          (err) => {
            expect(err.response?.data).toEqual('Not Found')
            expect(err.response?.status).toEqual(404)
          }
        )
      })
    })

    describe('List', () => {
      test('Should be able to list conversations with valid credentials', async () => {
        await listMessages(
          clients.first.messageId,
          clients.first.conversationId,
          clients.first.userId,
          Number.MAX_SAFE_INTEGER,
          clients.first.clientId,
          clients.first.clientToken
        )
        await listMessages(
          clients.second.messageId,
          clients.second.conversationId,
          clients.second.userId,
          Number.MAX_SAFE_INTEGER,
          clients.second.clientId,
          clients.second.clientToken
        )
      })

      test('Should not be able to list messages without being authenticated', async () => {
        await shouldFail(
          async () => listMessages(clients.first.messageId, clients.first.conversationId, clients.first.userId),
          (err) => {
            expect(err.response?.data).toEqual('Unauthorized')
            expect(err.response?.status).toEqual(401)
          }
        )
      })

      test('Should not be able to list messages for a conversation that does not exists', async () => {
        await shouldFail(
          async () =>
            listMessages(
              clients.first.messageId,
              uuid(),
              clients.first.userId,
              1,
              clients.first.clientId,
              clients.first.clientToken
            ),
          (err) => {
            expect(err.response?.data).toEqual('Not Found')
            expect(err.response?.status).toEqual(404)
          }
        )
      })

      test('Should not be able to list the messages of a conversation from another client', async () => {
        await shouldFail(
          async () =>
            listMessages(
              clients.second.messageId,
              clients.second.conversationId,
              clients.second.userId,
              1,
              clients.first.clientId,
              clients.first.clientToken
            ),
          (err) => {
            expect(err.response?.data).toEqual('Not Found')
            expect(err.response?.status).toEqual(404)
          }
        )
      })

      test('Should not allow to list conversations with an invalid limit', async () => {
        await shouldFail(
          async () =>
            listMessages(
              clients.first.messageId,
              clients.first.conversationId,
              clients.first.userId,
              Number.MAX_SAFE_INTEGER + 1,
              clients.first.clientId,
              clients.first.clientToken
            ),
          (err) => {
            expect(err.response?.data).toEqual('"query.limit" must be a safe number')
            expect(err.response?.status).toEqual(400)
          }
        )
      })
    })

    describe('Delete', () => {
      test('Should not be able to delete a message without being authenticated', async () => {
        await shouldFail(
          async () => deleteMessage(clients.first.messageId),
          (err) => {
            expect(err.response?.data).toEqual('Unauthorized')
            expect(err.response?.status).toEqual(401)
          }
        )
      })

      test('Should not be able to delete a message that does not exists', async () => {
        await shouldFail(
          async () => deleteMessage(uuid(), clients.first.clientId, clients.first.clientToken),
          (err) => {
            expect(err.response?.data).toEqual('Not Found')
            expect(err.response?.status).toEqual(404)
          }
        )
      })

      test('Should not be able to delete the message of a conversation from another client', async () => {
        await shouldFail(
          async () => deleteMessage(clients.second.conversationId, clients.first.clientId, clients.first.clientToken),
          (err) => {
            expect(err.response?.data).toEqual('Not Found')
            expect(err.response?.status).toEqual(404)
          }
        )
      })
    })

    describe('DeleteByConversation', () => {
      test('Should not be able to delete messages without being authenticated', async () => {
        await shouldFail(
          async () => deleteMessagesByConversation(clients.first.conversationId),
          (err) => {
            expect(err.response?.data).toEqual('Unauthorized')
            expect(err.response?.status).toEqual(401)
          }
        )
      })

      test('Should not be able to delete a message from a conversation that does not exists', async () => {
        await shouldFail(
          async () => deleteMessagesByConversation(uuid(), clients.first.clientId, clients.first.clientToken),
          (err) => {
            expect(err.response?.data).toEqual('Not Found')
            expect(err.response?.status).toEqual(404)
          }
        )
      })

      test('Should not be able to delete the message of a conversation from another client', async () => {
        await shouldFail(
          async () =>
            deleteMessagesByConversation(
              clients.second.conversationId,
              clients.first.clientId,
              clients.first.clientToken
            ),
          (err) => {
            expect(err.response?.data).toEqual('Not Found')
            expect(err.response?.status).toEqual(404)
          }
        )
      })
    })
  })
})
