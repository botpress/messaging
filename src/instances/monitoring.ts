import ms from 'ms'
import { ChannelService } from '../channels/service'
import { ConduitService } from '../conduits/service'
import { InstanceService } from './service'

export class InstanceMonitoring {
  constructor(private channels: ChannelService, private conduits: ConduitService, private instances: InstanceService) {}

  async setup() {
    setInterval(() => {
      void this.initializeOutdatedConduits()
      void this.loadNonLazyConduits()
    }, ms('15s'))

    void this.loadNonLazyConduits()
  }

  private async initializeOutdatedConduits() {
    const outdateds = await this.conduits.listOutdated(ms('10h'), 1000)

    for (const outdated of outdateds) {
      void this.instances.initialize(outdated.id)
    }
  }

  private async loadNonLazyConduits() {
    for (const channel of this.channels.list()) {
      if (channel.lazy) {
        continue
      }

      const conduits = await this.conduits.listByChannel(channel.id)
      for (const conduit of conduits) {
        void this.instances.get(conduit.id)
      }
    }
  }
}
