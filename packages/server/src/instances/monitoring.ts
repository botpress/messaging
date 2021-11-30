import { DistributedService, Logger } from '@botpress/messaging-engine'
import ms from 'ms'
import yn from 'yn'
import { ChannelService } from '../channels/service'
import { ConduitService } from '../conduits/service'
import { StatusService } from '../status/service'
import { InstanceService } from './service'

const MAX_ALLOWED_FAILURES = 5
const MAX_INITIALIZE_BATCH = 100

export class InstanceMonitoring {
  private timeout?: NodeJS.Timeout

  constructor(
    private logger: Logger,
    private distributed: DistributedService,
    private channels: ChannelService,
    private conduits: ConduitService,
    private status: StatusService,
    private instances: InstanceService
  ) {}

  async monitor() {
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
        await this.loadNonLazyConduits()
      })
    } catch (e) {
      this.logger.error(e, 'Error occurred while monitoring', (e as Error).message)
    } finally {
      this.timeout = setTimeout(this.tickMonitoring.bind(this), ms('15s'))
    }
  }

  private async initializeOutdatedConduits() {
    if (yn(process.env.SPINNED)) {
      return
    }

    const outdateds = await this.status.listOutdated(ms('10h'), MAX_ALLOWED_FAILURES, MAX_INITIALIZE_BATCH)
    for (const outdated of outdateds) {
      await this.instances.initialize(outdated.conduitId)
    }
  }

  private async loadNonLazyConduits() {
    if (!yn(process.env.SPINNED)) {
      return
    }

    for (const channel of this.channels.list()) {
      if (channel.lazy && !yn(process.env.NO_LAZY_LOADING)) {
        continue
      }

      const conduits = await this.conduits.listByChannel(channel.id)
      for (const conduit of conduits) {
        const failures = (await this.status.get(conduit.id))?.numberOfErrors || 0
        if (failures >= MAX_ALLOWED_FAILURES) {
          continue
        }

        await this.instances.get(conduit.id)
      }
    }
  }
}
