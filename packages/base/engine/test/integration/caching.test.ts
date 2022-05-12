import LRU from 'lru-cache'
import { CachingService, ServerCache, ServerCache2D } from '../../src'
import { setupApp, destroyApp, engine } from '../utils'

describe('CryptoService', () => {
  let caching: CachingService
  let state: {
    serverCache1?: ServerCache<string, string>
    serverCacheId1: string
    serverCacheOptions1: LRU.Options<string, string>

    serverCache2?: ServerCache<string, string>
    serverCacheId2: string
    serverCacheOptions2: LRU.Options<string, string>

    serverCache2D1?: ServerCache2D<string>
    serverCacheId2D1: string
    serverCacheOptions2D1: LRU.Options<string, string>
  }

  beforeAll(async () => {
    await setupApp()

    caching = engine.caching

    state = {
      serverCacheId1: 'id1',
      serverCacheOptions1: { max: 1 },

      serverCacheId2: 'id2',
      serverCacheOptions2: {},

      serverCacheId2D1: 'id3',
      serverCacheOptions2D1: { maxAge: 1 }
    }
  })

  afterAll(async () => {
    await destroyApp()
  })

  beforeEach(async () => {
    engine.caching.resetAll()
  })

  describe('NewLRU', () => {
    test('Should be able to create LRU caches', () => {
      caching.newLRU()
      caching.newLRU<string, string>()
      caching.newLRU<Buffer, number>()
    })
  })

  describe('NewServerCache', () => {
    test('Should be able to create server caches', async () => {
      state.serverCache1 = await caching.newServerCache(state.serverCacheId1, state.serverCacheOptions1)

      expect(state.serverCache1).not.toBeUndefined()
      expect(state.serverCache1.get).not.toBeUndefined()
      expect(state.serverCache1.set).not.toBeUndefined()

      {
        state.serverCache2 = await caching.newServerCache(state.serverCacheId2, state.serverCacheOptions2)

        expect(state.serverCache2).not.toBeUndefined()
        expect(state.serverCache2.get).not.toBeUndefined()
        expect(state.serverCache2.set).not.toBeUndefined()
      }
    })

    test('Should be able to override a server cache', async () => {
      const cache = await caching.newServerCache(state.serverCacheId1, state.serverCacheOptions1)

      expect(state.serverCache1).not.toEqual(cache)
      expect(caching.getCache(state.serverCacheId1)).toEqual(cache)

      state.serverCache1 = cache
    })
  })

  describe('NewServerCache2D', () => {
    test('Should be able to create a server 2D cache', async () => {
      state.serverCache2D1 = await caching.newServerCache2D(state.serverCacheId2D1, state.serverCacheOptions2D1)

      expect(state.serverCache2D1).not.toBeUndefined()
      expect(state.serverCache2D1.get).not.toBeUndefined()
      expect(state.serverCache2D1.set).not.toBeUndefined()
    })

    test('Should be able to override a server 2D cache', async () => {
      const cache = await caching.newServerCache2D<string>(state.serverCacheId2D1)

      expect(state.serverCache2D1).not.toEqual(cache)
      expect(caching.getCache(state.serverCacheId2D1)).toEqual(cache)

      state.serverCache2D1 = cache
    })
  })
})
