import { DistributedService, Logger, Service } from '@botpress/engine'
import ms from 'ms'
import { StatusService } from '../../status/service'
import { InstanceLifetimeService, MAX_ALLOWED_FAILURES } from '../lifetime/service'

const MAX_INITIALIZE_BATCH = 100

export class InstanceMonitoringService extends Service {
  private timeout?: NodeJS.Timeout

  constructor(
    private distributed: DistributedService,
    private status: StatusService,
    private lifetimes: InstanceLifetimeService,
    private logger: Logger
  ) {
    super()
  }

  async setup() {
    void this.tickMonitoring()
  }

  async destroy() {
    if (this.timeout) {
      clearTimeout(this.timeout)
    }
  }

  private async tickMonitoring() {
    try {
      await this.distributed.using('lock_instance_monitoring', async () => {
        await this.initializeOutdatedConduits()
      })
    } catch (e) {
      this.logger.error(e, 'Error occurred while monitoring', (e as Error).message)
    } finally {
      this.timeout = setTimeout(this.tickMonitoring.bind(this), ms('15s'))
    }
  }

  private async initializeOutdatedConduits() {
    const outdateds = await this.status.listOutdated(ms('10h'), MAX_ALLOWED_FAILURES, MAX_INITIALIZE_BATCH)
    for (const outdated of outdateds) {
      await this.lifetimes.initialize(outdated.conduitId)
    }
  }
}
