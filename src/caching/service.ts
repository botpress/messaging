import LRU from 'lru-cache'
import ms from 'ms'
import { Service } from '../base/service'

export class CachingService extends Service {
  async setup() {}

  newLRU<K, V>() {
    return new LRU<K, V>({ max: 50000, maxAge: ms('5min') })
  }
}
