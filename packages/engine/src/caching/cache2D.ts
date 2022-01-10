import LRU from 'lru-cache'
import { DistributedService } from '../distributed/service'

export class ServerCache2D<V> {
  private lru: LRU<string, V>

  constructor(private id: string, private distributed: DistributedService, options: LRU.Options<string, V>) {
    this.lru = new LRU(options)
    void this.distributed.subscribe(this.id, this.process.bind(this))
  }

  async process(event: ServerCacheEvent<string, V>) {
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

  invalidate(keyX: string, keyY: string) {
    void this.sendInvalidation(keyX, keyY)
  }

  async sendInvalidation(keyX: string, keyY: string) {
    try {
      await this.distributed.publish(this.id, { key: this.getKey(keyX, keyY) })
    } catch (e) {}
  }

  set(keyX: string, keyY: string, value: V, maxAge?: number, invalidate?: boolean): boolean {
    const res = this.lru.set(this.getKey(keyX, keyY), value, maxAge)

    if (invalidate) {
      this.invalidate(keyX, keyY)
    }

    return res
  }

  get(keyX: string, keyY: string): V | undefined {
    return this.lru.get(this.getKey(keyX, keyY))
  }

  peek(keyX: string, keyY: string): V | undefined {
    return this.lru.peek(this.getKey(keyX, keyY))
  }

  has(keyX: string, keyY: string): boolean {
    return this.lru.has(this.getKey(keyX, keyY))
  }

  del(keyX: string, keyY: string, invalidate?: boolean): void {
    this.lru.del(this.getKey(keyX, keyY))

    if (invalidate) {
      this.invalidate(keyX, keyY)
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

  getKey(keyX: string, keyY: string) {
    return `${keyX}~\`${keyY}`
  }

  getValues(key: string) {
    return key.split('~`')
  }
}

interface ServerCacheEvent<K, V> {
  key?: K
  value?: V
}
