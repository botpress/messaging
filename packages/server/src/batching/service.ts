import { Service } from '../base/service'
import { Batcher } from './batcher'

export class BatchingService extends Service {
  private batchers: { [cacheId: string]: Batcher<any> } = {}

  async setup() {}

  async destroy() {
    for (const batcher of Object.values(this.batchers)) {
      await batcher.flush()
    }
  }

  async newBatcher<T>(
    id: string,
    dependencies: Batcher<any>[],
    onFlush: (batch: T[]) => Promise<void>
  ): Promise<Batcher<T>> {
    const batcher = new Batcher(id, dependencies, onFlush)
    this.batchers[id] = batcher
    return batcher
  }
}
