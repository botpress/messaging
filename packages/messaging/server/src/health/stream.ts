import { Streamer } from '../base/streamer'
import { ChannelService } from '../channels/service'
import { ConduitService } from '../conduits/service'
import { ProvisionService } from '../provisions/service'
import { HealthCreatedEvent, HealthEvents } from './events'
import { HealthService } from './service'

export class HealthStream {
  constructor(
    private streamer: Streamer,
    private channels: ChannelService,
    private provisions: ProvisionService,
    private conduits: ConduitService,
    private health: HealthService
  ) {}

  async setup() {
    this.health.events.on(HealthEvents.Registered, this.handleHealthRegisted.bind(this))
  }

  private async handleHealthRegisted({ event }: HealthCreatedEvent) {
    const conduit = await this.conduits.get(event.conduitId)
    const provision = await this.provisions.fetchByProviderId(conduit.providerId)
    if (!provision) {
      return
    }

    const channel = this.channels.getById(conduit.channelId)
    await this.streamer.stream(
      'health.new',
      { channel: channel.meta.name, event: { ...this.health.makeReadable(event) } },
      provision.clientId
    )
  }
}
