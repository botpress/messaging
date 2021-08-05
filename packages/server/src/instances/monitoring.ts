import ms from 'ms'
import yn from 'yn'
import { ChannelService } from '../channels/service'
import { ConduitService } from '../conduits/service'
import { Logger } from '../logger/types'
import { InstanceService } from './service'

const MAX_ALLOWED_FAILURES = 5

export class InstanceMonitoring {
  constructor(
    private logger: Logger,
    private channels: ChannelService,
    private conduits: ConduitService,
    private instances: InstanceService,
    private failures: { [conduitId: string]: number }
  ) {}

  async setup() {
    await this.tickMonitoring()

    setInterval(this.tickMonitoring.bind(this), ms('15s'))
  }

  private async tickMonitoring() {
    try {
      await this.initializeOutdatedConduits()
      await this.loadNonLazyConduits()
    } catch (e) {
      this.logger.error('Error occurred while monitoring.', e.message)
    }
  }

  private async initializeOutdatedConduits() {
    const outdateds = await this.conduits.listOutdated(ms('10h'), 1000)

    for (const outdated of outdateds) {
      // TODO: replace by StatusService
      if (this.failures[outdated.id] >= MAX_ALLOWED_FAILURES) {
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
        // TODO: replace by StatusService
        if (this.failures[conduit.id] >= MAX_ALLOWED_FAILURES) {
          continue
        }

        await this.instances.get(conduit.id)
      }
    }
  }
}
