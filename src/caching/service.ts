import LRU from 'lru-cache'
import ms from 'ms'
import { Service } from '../base/service'
import { DistributedService } from '../distributed/service'
import { ServerCache } from './cache'

export class CachingService extends Service {
  private caches: { [cacheId: string]: ServerCache<any, any> } = {}

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
}
