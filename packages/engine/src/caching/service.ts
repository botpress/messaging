import LRU from 'lru-cache'
import ms from 'ms'
import { Service } from '../base/service'
import { DistributedService } from '../distributed/service'
import { ServerCache } from './cache'
import { ServerCache2D } from './cache2D'

export class CachingService extends Service {
  private caches: { [cacheId: string]: ServerCache<any, any> | ServerCache2D<any> } = {}

  constructor(private distributedService: DistributedService) {
    super()
  }

  async setup() {}

  newLRU<K, V>() {
    return new LRU<K, V>({ max: 50000, maxAge: ms('5min') })
  }

  async newServerCache<K, V>(id: string, options?: LRU.Options<K, V>) {
    const cache = new ServerCache<K, V>(
      id,
      this.distributedService,
      options ?? {
        max: 50000,
        maxAge: ms('5min')
      }
    )

    this.caches[id] = cache

    return cache
  }

  async newServerCache2D<V>(id: string, options?: LRU.Options<string, V>) {
    const cache = new ServerCache2D<V>(
      id,
      this.distributedService,
      options ?? {
        max: 50000,
        maxAge: ms('5min')
      }
    )

    this.caches[id] = cache

    return cache
  }

  getCache<C extends ServerCache<any, any> | ServerCache2D<any>>(id: string): C | undefined {
    return this.caches[id] as C
  }

  resetAll() {
    for (const cache of Object.values(this.caches)) {
      cache.reset()
    }
  }
}
