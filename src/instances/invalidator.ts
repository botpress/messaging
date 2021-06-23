import { uuid } from '../base/types'
import { ServerCache } from '../caching/cache'
import { ConduitInstance } from '../channels/base/conduit'
import { ChannelService } from '../channels/service'
import { ClientEvents, ClientUpdatedEvent } from '../clients/events'
import { ClientService } from '../clients/service'
import { ConduitEvents } from '../conduits/events'
import { ConduitService } from '../conduits/service'
import { ProviderService } from '../providers/service'
import { InstanceService } from './service'

export class InstanceInvalidator {
  private cache!: ServerCache<uuid, ConduitInstance<any, any>>

  constructor(
    private channels: ChannelService,
    private providers: ProviderService,
    private conduits: ConduitService,
    private clients: ClientService,
    private instances: InstanceService
  ) {}

  async setup(cache: ServerCache<uuid, ConduitInstance<any, any>>) {
    this.cache = cache

    this.conduits.events.on(ConduitEvents.Created, this.onConduitCreated.bind(this))
    this.conduits.events.on(ConduitEvents.Deleting, this.onConduitDeleting.bind(this))
    this.conduits.events.on(ConduitEvents.Updated, this.onConduitUpdated.bind(this))
    this.clients.events.on(ClientEvents.Updated, this.onClientUpdated.bind(this))
  }

  private async onConduitCreated(conduitId: uuid) {
    const conduit = (await this.conduits.get(conduitId))!
    const channel = this.channels.getById(conduit.channelId)

    if (channel.requiresInitialization) {
      await this.instances.initialize(conduitId)
    }

    if (!channel.lazy) {
      await this.instances.get(conduit.id)
    }
  }

  private async onConduitDeleting(conduitId: uuid) {
    this.cache.del(conduitId)
  }

  private async onConduitUpdated(conduitId: uuid) {
    this.cache.del(conduitId)

    const conduit = (await this.conduits.get(conduitId))!
    const channel = this.channels.getById(conduit.channelId)

    if (channel.requiresInitialization) {
      await this.instances.initialize(conduitId)
    }

    if (!channel.lazy) {
      await this.instances.get(conduit.id)
    }
  }

  private async onClientUpdated({ clientId, oldClient }: ClientUpdatedEvent) {
    const client = (await this.clients.getById(clientId))!

    if (client.providerId === oldClient.providerId) {
      return
    }

    const oldProvider = await this.providers.getById(oldClient.providerId)
    if (oldProvider?.sandbox) {
      return
    }

    const conduits = await this.conduits.listByProvider(oldClient.providerId)
    for (const conduit of conduits) {
      this.cache.del(conduit.id)
    }
  }
}
