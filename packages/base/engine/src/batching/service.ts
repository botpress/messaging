import ms from 'ms'
import yn from 'yn'
import { Service } from '../base/service'
import { Logger } from '../logger/types'
import { Batcher, DelayedBatcher, ImmediateBatcher } from './batcher'

const MAX_BATCH_SIZE = 400

export class BatchingService extends Service {
  private enabled!: boolean
  private batchers: { [cacheId: string]: Batcher<any> } = {}
  private intervals: { [cacheId: string]: NodeJS.Timer } = {}
  private logger = new Logger('Batching')

  async setup() {
    this.enabled = !!yn(process.env.BATCHING_ENABLED)
  }

  async destroy() {
    for (const batcher of Object.values(this.batchers)) {
      try {
        clearInterval(this.intervals[batcher.id])

        await batcher.flush()
      } catch (e) {
        this.logger.error(e, `Failed to destroy batch ${batcher.id}`)
      }
    }
  }

  async newBatcher<T>(
    id: string,
    dependencies: Batcher<any>[],
    onFlush: (batch: T[]) => Promise<void>
  ): Promise<Batcher<T>> {
    if (this.enabled) {
      const batcher = new DelayedBatcher(id, dependencies, MAX_BATCH_SIZE, onFlush)

      if (this.intervals[id]) {
        clearInterval(this.intervals[id])
      }

      this.intervals[id] = setInterval(async () => {
        await batcher.flush()
      }, ms('15s'))

      this.batchers[id] = batcher
      return batcher
    } else {
      const batcher = new ImmediateBatcher(id, onFlush)
      this.batchers[id] = batcher
      return batcher
    }
  }
}
