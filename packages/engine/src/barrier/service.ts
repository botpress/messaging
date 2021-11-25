import { Service } from '../base/service'
import { CachingService } from '../caching/service'
import { Barrier2D } from './barrier'

export class BarrierService extends Service {
  constructor(private caching: CachingService) {
    super()
  }

  async setup() {}

  async newBarrier2D<T>(id: string): Promise<Barrier2D<T>> {
    const locks = await this.caching.newServerCache2D<Promise<T>>(`cache_locks_${id}`)
    return new Barrier2D(id, locks)
  }
}
