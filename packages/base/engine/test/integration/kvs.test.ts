import { KvsService } from '../../src'
import { setupApp, destroyApp, engine } from '../utils'

describe('KvsService', () => {
  let kvs: KvsService
  let state: {
    key1: string
    value1: any
    key2: string
    value2: any
  }

  beforeAll(async () => {
    await setupApp()

    kvs = engine.kvs

    state = {
      key1: 'key1',
      value1: { joe: 'bob' },
      key2: 'key2',
      value2: { bob: 'joe' }
    }
  })

  afterAll(async () => {
    await destroyApp()
  })

  beforeEach(async () => {
    engine.caching.resetAll()
  })

  describe('Set', () => {
    test('Should be able to store a key and value in the database', async () => {
      await kvs.set(state.key1, state.value1)

      const value = await kvs.get(state.key1)

      expect(value).toEqual(state.value1)
    })

    test('Should be able to override a value for a given key', async () => {
      await kvs.set(state.key1, state.value2)

      const value = await kvs.get(state.key1)

      expect(value).toEqual(state.value2)
    })
  })

  describe('Get', () => {
    test('Should be able to get a value for a given key', async () => {
      await kvs.set(state.key2, state.value2)

      const value = await kvs.get(state.key2)

      expect(value).toEqual(state.value2)
    })

    test('Should return undefined if the key is not found', async () => {
      const value = await kvs.get('unknown')

      expect(value).toBeUndefined()
    })
  })
})
