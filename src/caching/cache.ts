import LRU from 'lru-cache'
import { DistributedService } from '../distributed/service'

export class ServerCache<K, V> {
  private lru: LRU<K, V>

  constructor(private id: string, private distributed: DistributedService, options: LRU.Options<K, V>) {
    this.lru = new LRU(options)
    void this.distributed.listen(this.id, this.process)
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
    void this.distributed.send(this.id, { key })
  }

  set(key: K, value: V, maxAge?: number): boolean {
    return this.lru.set(key, value, maxAge)
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

  del(key: K): void {
    this.lru.del(key)
  }
}

export interface ServerCacheEvent<K, V> {
  key?: K
  value?: V
}
