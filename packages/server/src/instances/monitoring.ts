import ms from 'ms'
import yn from 'yn'
import { ChannelService } from '../channels/service'
import { ConduitService } from '../conduits/service'
import { DistributedService } from '../distributed/service'
import { Logger } from '../logger/types'
import { StatusService } from '../status/service'
import { InstanceService } from './service'

const MAX_ALLOWED_FAILURES = 5

export class InstanceMonitoring {
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

  private async tickMonitoring() {
    try {
      await this.distributed.using('lock_instance_monitoring', async () => {
        await this.initializeOutdatedConduits()
        await this.loadNonLazyConduits()
      })
    } catch (e) {
      this.logger.error(e, 'Error occurred while monitoring', e.message)
    } finally {
      setTimeout(this.tickMonitoring.bind(this), ms('15s'))
    }
  }

  private async initializeOutdatedConduits() {
    const outdateds = await this.conduits.listOutdated(ms('10h'), 1000)

    for (const outdated of outdateds) {
      const failures = (await this.status.getNumberOfErrors(outdated.id)) || 0
      if (!yn(process.env.SPINNED) && failures >= MAX_ALLOWED_FAILURES) {
        continue
      }

      await this.instances.initialize(outdated.id)
    }
  }

  private async loadNonLazyConduits() {
    const lazyLoadingEnabled = !yn(process.env.NO_LAZY_LOADING)

    for (const channel of this.channels.list()) {
      if (channel.lazy && lazyLoadingEnabled) {
        continue
      }

      const conduits = await this.conduits.listByChannel(channel.id)
      for (const conduit of conduits) {
        const failures = (await this.status.getNumberOfErrors(conduit.id)) || 0
        if (!yn(process.env.SPINNED) && failures >= MAX_ALLOWED_FAILURES) {
          continue
        }

        await this.instances.get(conduit.id)
      }
    }
  }
}
