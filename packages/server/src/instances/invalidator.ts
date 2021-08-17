import { uuid } from '@botpress/messaging-base'
import yn from 'yn'
import { ServerCache } from '../caching/cache'
import { ConduitInstance } from '../channels/base/conduit'
import { ChannelService } from '../channels/service'
import { ClientEvents, ClientUpdatedEvent } from '../clients/events'
import { ClientService } from '../clients/service'
import { ConduitEvents } from '../conduits/events'
import { ConduitService } from '../conduits/service'
import { ProviderEvents, ProviderUpdatedEvent } from '../providers/events'
import { ProviderService } from '../providers/service'
import { StatusService } from '../status/service'
import { InstanceService } from './service'

export class InstanceInvalidator {
  private cache!: ServerCache<uuid, ConduitInstance<any, any>>
  private lazyLoadingEnabled!: boolean

  constructor(
    private channels: ChannelService,
    private providers: ProviderService,
    private conduits: ConduitService,
    private clients: ClientService,
    private statusService: StatusService,
    private instances: InstanceService
  ) {}

  async setup(cache: ServerCache<uuid, ConduitInstance<any, any>>) {
    this.cache = cache
    this.lazyLoadingEnabled = !yn(process.env.NO_LAZY_LOADING)

    this.conduits.events.on(ConduitEvents.Created, this.onConduitCreated.bind(this))
    this.conduits.events.on(ConduitEvents.Deleting, this.onConduitDeleting.bind(this))
    this.conduits.events.on(ConduitEvents.Updated, this.onConduitUpdated.bind(this))
    this.clients.events.on(ClientEvents.Updated, this.onClientUpdated.bind(this))
    this.providers.events.on(ProviderEvents.Updated, this.onProviderUpdated.bind(this))
  }

  private async onConduitCreated(conduitId: uuid) {
    const conduit = (await this.conduits.get(conduitId))!
    const channel = this.channels.getById(conduit.channelId)

    if (channel.initiable) {
      await this.instances.initialize(conduitId)
    }

    if (!channel.lazy || !this.lazyLoadingEnabled) {
      await this.instances.get(conduit.id)
    }
  }

  private async onConduitDeleting(conduitId: uuid) {
    this.cache.del(conduitId, true)
  }

  private async onConduitUpdated(conduitId: uuid) {
    this.cache.del(conduitId, true)
    await this.statusService.clearErrors(conduitId)

    const conduit = (await this.conduits.get(conduitId))!
    const channel = this.channels.getById(conduit.channelId)

    if (channel.initiable) {
      await this.instances.initialize(conduitId)
    }

    if (!channel.lazy || !this.lazyLoadingEnabled) {
      await this.instances.get(conduit.id)
    }
  }

  private async onClientUpdated({ clientId, oldClient }: ClientUpdatedEvent) {
    const client = (await this.clients.getById(clientId))!

    if (client.providerId === oldClient.providerId) {
      return
    }

    const oldProvider = await this.providers.getById(oldClient.providerId)
    if (!oldProvider || oldProvider?.sandbox) {
      return
    }

    const conduits = await this.conduits.listByProvider(oldClient.providerId)
    for (const conduit of conduits) {
      this.cache.del(conduit.id, true)
    }
  }

  private async onProviderUpdated({ providerId, oldProvider }: ProviderUpdatedEvent) {
    const conduits = await this.conduits.listByProvider(providerId)

    for (const conduit of conduits) {
      this.cache.del(conduit.id, true)
    }
  }
}
