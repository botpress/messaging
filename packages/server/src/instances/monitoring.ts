import ms from 'ms'
import yn from 'yn'
import { ChannelService } from '../channels/service'
import { ConduitService } from '../conduits/service'
import { InstanceService } from './service'

const MAX_ALLOWED_FAILURES = 5

export class InstanceMonitoring {
  constructor(
    private channels: ChannelService,
    private conduits: ConduitService,
    private instances: InstanceService,
    private failures: { [conduitId: string]: number }
  ) {}

  async setup() {
    await this.initializeOutdatedConduits()
    await this.loadNonLazyConduits()

    setInterval(() => {
      void this.initializeOutdatedConduits()
      void this.loadNonLazyConduits()
    }, ms('15s'))
  }

  private async initializeOutdatedConduits() {
    const outdateds = await this.conduits.listOutdated(ms('10h'), 1000)

    const promises = []
    for (const outdated of outdateds) {
      // TODO: replace by HealthService
      if (this.failures[outdated.id] >= MAX_ALLOWED_FAILURES) {
        continue
      }

      promises.push(this.instances.initialize(outdated.id))
    }

    return Promise.all(promises)
  }

  private async loadNonLazyConduits() {
    const lazyLoadingEnabled = !yn(process.env.NO_LAZY_LOADING)

    const promises = []
    for (const channel of this.channels.list()) {
      if (channel.lazy && lazyLoadingEnabled) {
        continue
      }

      const conduits = await this.conduits.listByChannel(channel.id)
      for (const conduit of conduits) {
        // TODO: replace by HealthService
        if (this.failures[conduit.id] >= MAX_ALLOWED_FAILURES) {
          continue
        }

        promises.push(this.instances.get(conduit.id))
      }
    }

    return Promise.all(promises)
  }
}
