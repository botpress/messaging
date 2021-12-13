import { Streamer } from '../base/streamer'
import { ChannelService } from '../channels/service'
import { ClientService } from '../clients/service'
import { ConduitService } from '../conduits/service'
import { HealthCreatedEvent, HealthEvents } from './events'
import { HealthService } from './service'

export class HealthStream {
  constructor(
    private streamer: Streamer,
    private channels: ChannelService,
    private clients: ClientService,
    private conduits: ConduitService,
    private health: HealthService
  ) {}

  async setup() {
    this.health.events.on(HealthEvents.Registered, this.handleHealthRegisted.bind(this))
  }

  private async handleHealthRegisted({ event }: HealthCreatedEvent) {
    const conduit = await this.conduits.get(event.conduitId)
    const client = await this.clients.getByProviderId(conduit.providerId)
    if (!client) {
      return
    }

    const channel = this.channels.getById(conduit.channelId)
    await this.streamer.stream(
      'health.new',
      { channel: channel.meta.name, event: { ...this.health.makeReadable(event) } },
      client.id
    )
  }
}
