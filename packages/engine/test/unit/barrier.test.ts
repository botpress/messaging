import { Barrier2D } from '../../src/barrier/barrier'
import { ServerCache2D } from '../../src/caching/cache2D'
import { DistributedService } from '../../src/distributed/service'

// TODO: Move this implementation in a __mock__ folder or file and implement all functions
class MockedServerCache2D<V> {
  private lru: { [key: string]: V }

  constructor(private _id: string, private _distributed: DistributedService, _options = {}) {
    this.lru = {}
  }

  set(keyX: string, keyY: string, value: V, _maxAge?: number, _invalidate?: boolean): boolean {
    this.lru[this.getKey(keyX, keyY)] = value

    return true
  }

  get(keyX: string, keyY: string): V | undefined {
    return this.lru[this.getKey(keyX, keyY)]
  }

  del(keyX: string, keyY: string, _invalidate?: boolean): void {
    delete this.lru[this.getKey(keyX, keyY)]
  }

  private getKey(keyX: string, keyY: string) {
    return `${keyX}${keyY}`
  }
}

jest.mock('../../src/caching/cache2D')
jest.mock('../../src/distributed/service')

describe('Barrier', () => {
  const id = 'test_barrier'
  const keyX = 'key_x'
  const keyY = 'key_y'
  const cache = <T>() =>
    new MockedServerCache2D<T>('cache', new DistributedService(), {}) as unknown as ServerCache2D<T>

  test('Should instantiate without throwing any error when given an id and a cache', () => {
    try {
      new Barrier2D<any>(id, cache<any>())
    } catch (e) {
      fail(e)
    }
  })

  describe('once', () => {
    test('Should return the same promise if called multiple times before the callback is being resolved', async () => {
      const cacheInstance = cache<any>()
      const barrier = new Barrier2D<any>(id, cacheInstance)

      const spyGet = jest.spyOn(cacheInstance, 'get')
      const spySet = jest.spyOn(cacheInstance, 'set')
      const spyDel = jest.spyOn(cacheInstance, 'del')

      const count = 20
      const callback = jest.fn().mockImplementation(async () => new Promise(() => {}))
      const callBarrier = async () => {
        void barrier.once(keyX, keyY, callback)
      }

      for (let i = 0; i < count; i++) {
        void callBarrier()
      }

      expect(callback).toHaveBeenCalledTimes(1)
      expect(spyGet).toBeCalledTimes(count)
      expect(spySet).toBeCalledTimes(1)
      // Promise never resolves
      expect(spyDel).toBeCalledTimes(0)
    })
  })
})
