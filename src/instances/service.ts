import _ from 'lodash'
import ms from 'ms'
import { App } from '../app'
import { Service } from '../base/service'
import { uuid } from '../base/types'
import { ServerCache2D } from '../caching/cache2D'
import { CachingService } from '../caching/service'
import { ConduitInstance } from '../channels/base/conduit'
import { ChannelService } from '../channels/service'
import { ClientService } from '../clients/service'
import { ConduitCreatedEvent, ConduitDeletingEvent, ConduitEvents, ConduitUpdatingEvent } from '../conduits/events'
import { ConduitService } from '../conduits/service'
import { ProviderService } from '../providers/service'

export class InstanceService extends Service {
  private cache!: ServerCache2D<ConduitInstance<any, any>>

  constructor(
    private cachingService: CachingService,
    private channelService: ChannelService,
    private providerService: ProviderService,
    private conduitService: ConduitService,
    private clientService: ClientService,
    private app: App
  ) {
    super()
  }

  async setup() {
    this.cache = await this.cachingService.newServerCache2D('cache_instance_by_provider_id', {
      dispose: async (k, v) => {
        await v.destroy()
      },
      max: 50000,
      maxAge: ms('30min')
    })

    this.conduitService.events.on(ConduitEvents.Created, this.onConduitCreated.bind(this))
    this.conduitService.events.on(ConduitEvents.Deleting, this.onConduitDeleting.bind(this))
    this.conduitService.events.on(ConduitEvents.Updated, this.onConduitUpdated.bind(this))
    // TODO: we need to do something when to providerId property of a client changes aswell...

    setInterval(() => {
      void this.initializeOutdatedConduits()
      void this.loadNonLazyConduits()
    }, ms('15s'))

    void this.loadNonLazyConduits()
  }

  async initialize(providerId: uuid, channelId: uuid) {
    const instance = await this.get(providerId, channelId)
    await instance.initialize()

    await this.conduitService.updateInitialized(providerId, channelId)
  }

  async get(providerId: uuid, channelId: uuid): Promise<ConduitInstance<any, any>> {
    const cached = this.cache.get(providerId, channelId)
    if (cached) {
      return cached
    }

    const provider = (await this.providerService.getById(providerId))!
    const client = (await this.clientService.getByProviderId(providerId))!
    const conduit = await this.conduitService.get(provider.id, channelId)
    const channel = this.channelService.getById(channelId)
    const instance = channel.createConduit()

    await instance.setup(
      this.app,
      {
        ...conduit?.config,
        externalUrl: this.app.config.current.externalUrl
      },
      channel,
      provider.name,
      client.id
    )

    this.cache.set(provider.id, channelId, instance, channel.lazy ? undefined : Infinity)

    return instance
  }

  private async initializeOutdatedConduits() {
    const outdateds = await this.conduitService.listOutdated(ms('10h'), 1000)

    for (const outdated of outdateds) {
      void this.initialize(outdated.providerId, outdated.channelId)
    }
  }

  private async loadNonLazyConduits() {
    for (const channel of this.channelService.list()) {
      if (channel.lazy) {
        continue
      }

      const conduits = await this.conduitService.listByChannel(channel.id)
      for (const conduit of conduits) {
        const cached = this.cache.get(conduit.providerId, channel.id)
        if (!cached) {
          void this.get(conduit.providerId, channel.id)
        }
      }
    }
  }

  private async onConduitCreated({ providerId, channelId }: ConduitCreatedEvent) {
    if (this.channelService.getById(channelId).requiresInitialization) {
      await this.initialize(providerId, channelId)
    }
  }

  private async onConduitDeleting({ providerId, channelId }: ConduitDeletingEvent) {
    this.cache.del(providerId, channelId)
  }

  private async onConduitUpdated({ providerId, channelId }: ConduitUpdatingEvent) {
    this.cache.del(providerId, channelId)

    if (this.channelService.getById(channelId).requiresInitialization) {
      await this.initialize(providerId, channelId)
    }
  }
}
