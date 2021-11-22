import LRU from 'lru-cache'
import { DistributedService } from '../distributed/service'

export class ServerCache<K, V> {
  private lru: LRU<K, V>

  constructor(private id: string, private distributed: DistributedService, options: LRU.Options<K, V>) {
    this.lru = new LRU(options)
    void this.distributed.subscribe(this.id, this.process.bind(this))
  }

  async process(event: ServerCacheEvent<K, V>) {
    const { key, value } = event

    if (!key || !this.lru.has(key)) {
      return
    }

    if (value) {
      this.lru.set(key, value)
    } else {
      this.lru.del(key)
    }
  }

  invalidate(key: K) {
    void this.sendInvalidation(key)
  }

  async sendInvalidation(key: K) {
    try {
      await this.distributed.publish(this.id, { key })
    } catch (e) {}
  }

  set(key: K, value: V, maxAge?: number, invalidate?: boolean): boolean {
    const res = this.lru.set(key, value, maxAge)

    if (invalidate) {
      this.invalidate(key)
    }

    return res
  }

  get(key: K): V | undefined {
    return this.lru.get(key)
  }

  peek(key: K): V | undefined {
    return this.lru.peek(key)
  }

  has(key: K): boolean {
    return this.lru.has(key)
  }

  del(key: K, invalidate?: boolean): void {
    this.lru.del(key)

    if (invalidate) {
      this.invalidate(key)
    }
  }

  prune() {
    this.lru.prune()
  }

  reset() {
    this.lru.reset()
  }

  keys() {
    return this.lru.keys()
  }
}

interface ServerCacheEvent<K, V> {
  key?: K
  value?: V
}
