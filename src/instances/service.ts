import _ from 'lodash'
import ms from 'ms'
import { App } from '../app'
import { Service } from '../base/service'
import { uuid } from '../base/types'
import { ServerCache } from '../caching/cache'
import { CachingService } from '../caching/service'
import { ConduitInstance } from '../channels/base/conduit'
import { ChannelService } from '../channels/service'
import { ClientService } from '../clients/service'
import { ConduitEvents } from '../conduits/events'
import { ConduitService } from '../conduits/service'
import { ProviderService } from '../providers/service'

export class InstanceService extends Service {
  private cache!: ServerCache<uuid, ConduitInstance<any, any>>

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
    this.cache = await this.cachingService.newServerCache('cache_instance_by_provider_id', {
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

  async initialize(conduitId: uuid) {
    const instance = await this.get(conduitId)
    await instance.initialize()

    await this.conduitService.updateInitialized(conduitId)
  }

  async get(conduitId: uuid): Promise<ConduitInstance<any, any>> {
    const cached = this.cache.get(conduitId)
    if (cached) {
      return cached
    }

    const conduit = (await this.conduitService.get(conduitId))!
    const provider = (await this.providerService.getById(conduit.providerId))!
    const channel = this.channelService.getById(conduit.channelId)
    const client = provider.sandbox ? undefined : await this.clientService.getByProviderId(provider.id)
    const instance = channel.createConduit()

    await instance.setup(
      this.app,
      {
        ...conduit?.config,
        externalUrl: this.app.config.current.externalUrl
      },
      channel,
      provider.name,
      client?.id,
      provider.sandbox
    )

    this.cache.set(conduitId, instance, channel.lazy ? undefined : Infinity)

    return instance
  }

  private async initializeOutdatedConduits() {
    const outdateds = await this.conduitService.listOutdated(ms('10h'), 1000)

    for (const outdated of outdateds) {
      void this.initialize(outdated.id)
    }
  }

  private async loadNonLazyConduits() {
    for (const channel of this.channelService.list()) {
      if (channel.lazy) {
        continue
      }

      const conduits = await this.conduitService.listByChannel(channel.id)
      for (const conduit of conduits) {
        const cached = this.cache.get(conduit.id)
        if (!cached) {
          void this.get(conduit.id)
        }
      }
    }
  }

  private async onConduitCreated(conduitId: uuid) {
    const conduit = (await this.conduitService.get(conduitId))!

    if (this.channelService.getById(conduit.channelId).requiresInitialization) {
      await this.initialize(conduitId)
    }
  }

  private async onConduitDeleting(conduitId: uuid) {
    this.cache.del(conduitId)
  }

  private async onConduitUpdated(conduitId: uuid) {
    this.cache.del(conduitId)

    const conduit = (await this.conduitService.get(conduitId))!

    if (this.channelService.getById(conduit.channelId).requiresInitialization) {
      await this.initialize(conduitId)
    }
  }
}
