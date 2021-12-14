import { SyncRequest, SyncResult } from '@botpress/messaging-base'
import axios, { AxiosError, AxiosRequestConfig, Method } from 'axios'
import _ from 'lodash'
import { v4 as uuid } from 'uuid'
import froth from './mocha-froth'

const HTTP_METHODS: Method[] = ['GET', 'HEAD', 'POST', 'PUT', 'DELETE', 'PURGE', 'OPTIONS', 'LINK', 'UNLINK', 'PATCH']

const http = () => axios.create({ baseURL: 'http://localhost:3100' })

const getUnallowedMethods = (...allowed: Method[]) => {
  return HTTP_METHODS.filter((val) => !allowed.includes(val.toUpperCase() as Method))
}

let clientId = ''

const sync = async (data?: SyncRequest, config?: AxiosRequestConfig) => {
  const client = http()

  const res = await client.post<SyncResult>('/api/sync', data, config)

  expect(res.data).toEqual({ id: expect.anything(), token: expect.anything(), webhooks: expect.anything() })
  expect(res.status).toEqual(200)

  return res.data
}

const shouldFail = async (func: Function, onError: (err: AxiosError) => void) => {
  try {
    const res = await func()

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
  describe('Sync', () => {
    test('Should not allow any other methods than POST', async () => {
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

      clientId = res.id
    })

    test('Should return unauthorized if token is invalid', async () => {
      const tokens = froth(10, 88, 88, { none: false })

      for (const token of tokens) {
        await shouldFail(
          async () => sync({ id: clientId, token }),
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

    test('Should return unauthorized if token is empty', async () => {
      const token = undefined

      await shouldFail(
        async () => sync({ id: clientId, token }),
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
          async () => sync({ id: clientId, token }),
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
      const uuidLength = uuid().length
      const ids = froth(10, uuidLength, uuidLength, { none: false })

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

  describe('', () => {})
})
