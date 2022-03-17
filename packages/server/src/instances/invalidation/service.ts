import { uuid } from '@botpress/messaging-base'
import { Service } from '@botpress/messaging-engine'
import yn from 'yn'
import { ChannelService } from '../../channels/service'
import { ConduitEvents } from '../../conduits/events'
import { ConduitService } from '../../conduits/service'
import { ProviderEvents, ProviderUpdatedEvent } from '../../providers/events'
import { ProviderService } from '../../providers/service'
import { StatusService } from '../../status/service'
import { InstanceLifetimeService } from '../lifetime/service'

export class InstanceInvalidationService extends Service {
  private lazyLoadingEnabled!: boolean

  constructor(
    private channels: ChannelService,
    private providers: ProviderService,
    private conduits: ConduitService,
    private status: StatusService,
    private lifetimes: InstanceLifetimeService
  ) {
    super()
  }

  async setup() {
    this.lazyLoadingEnabled = !yn(process.env.NO_LAZY_LOADING)

    this.conduits.events.on(ConduitEvents.Created, this.onConduitCreated.bind(this))
    this.conduits.events.on(ConduitEvents.Deleting, this.onConduitDeleting.bind(this))
    this.conduits.events.on(ConduitEvents.Updated, this.onConduitUpdated.bind(this))
    this.providers.events.on(ProviderEvents.Updated, this.onProviderUpdated.bind(this))
  }

  private async onConduitCreated(conduitId: uuid) {
    const conduit = await this.conduits.get(conduitId)
    const channel = this.channels.getById(conduit.channelId)

    if (channel.meta.initiable) {
      await this.lifetimes.initialize(conduitId)
    }

    if (!channel.meta.lazy || !this.lazyLoadingEnabled) {
      await this.lifetimes.start(conduit.id)
    }
  }

  private async onConduitDeleting(conduitId: uuid) {
    await this.lifetimes.stop(conduitId)
  }

  private async onConduitUpdated(conduitId: uuid) {
    await this.lifetimes.stop(conduitId)
    await this.status.updateInitializedOn(conduitId, undefined)
    await this.status.clearErrors(conduitId)

    const conduit = await this.conduits.get(conduitId)
    const channel = this.channels.getById(conduit.channelId)

    if (channel.meta.initiable) {
      await this.lifetimes.initialize(conduitId)
    }

    if (!channel.meta.lazy || !this.lazyLoadingEnabled) {
      await this.lifetimes.start(conduit.id)
    }
  }

  private async onProviderUpdated({ providerId }: ProviderUpdatedEvent) {
    const conduits = await this.conduits.listByProvider(providerId)

    for (const conduit of conduits) {
      await this.lifetimes.stop(conduit.id)
    }
  }
}
