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
  private cacheByName!: ServerCache2D<ConduitInstance<any, any>>
  private cacheById!: ServerCache2D<ConduitInstance<any, any>>

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
    this.cacheByName = await this.cachingService.newServerCache2D('cache_instance_by_provider_name')
    this.cacheById = await this.cachingService.newServerCache2D('cache_instance_by_provider_id')

    this.conduitService.events.on(ConduitEvents.Created, this.onConduitCreated.bind(this))
    this.conduitService.events.on(ConduitEvents.Deleting, this.onConduitDeleting.bind(this))
    this.conduitService.events.on(ConduitEvents.Updated, this.onConduitUpdated.bind(this))
    // TODO: we need to do something when to providerId property of a client changes aswell...

    setInterval(() => this.initializeOutdatedConduits(), ms('15s'))
  }

  async initializeInstance(providerId: uuid, channelId: uuid) {
    const instance = await this.getInstanceByProviderId(providerId, channelId)
    await instance.initialize()

    await this.conduitService.updateInitialized(providerId, channelId)
  }

  async getInstanceByProviderName(providerName: string, channelId: uuid): Promise<ConduitInstance<any, any>> {
    const cached = this.cacheByName.get(providerName, channelId)
    if (cached) {
      return cached
    }

    const provider = (await this.providerService.getByName(providerName))!
    return this.getInstanceByProviderId(provider.id, channelId)
  }

  async getInstanceByProviderId(providerId: uuid, channelId: uuid): Promise<ConduitInstance<any, any>> {
    const cached = this.cacheById.get(providerId, channelId)
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

    this.cacheById.set(provider.id, channelId, instance)
    this.cacheByName.set(provider.name, channelId, instance)

    return instance
  }

  private async initializeOutdatedConduits() {
    const outdateds = await this.conduitService.listOutdated(ms('10h'), 1000)

    for (const outdated of outdateds) {
      void this.initializeInstance(outdated.providerId, outdated.channelId)
    }
  }

  private async onConduitCreated({ providerId, channelId }: ConduitCreatedEvent) {
    if (this.channelService.getById(channelId).requiresInitialization) {
      await this.initializeInstance(providerId, channelId)
    }
  }

  private async onConduitDeleting({ providerId, channelId }: ConduitDeletingEvent) {
    const provider = await this.providerService.getById(providerId)

    this.cacheById.del(providerId, channelId)
    this.cacheByName.del(provider!.name, channelId)
  }

  private async onConduitUpdated({ providerId, channelId }: ConduitUpdatingEvent) {
    const provider = await this.providerService.getById(providerId)

    this.cacheById.del(providerId, channelId)
    this.cacheByName.del(provider!.name, channelId)

    if (this.channelService.getById(channelId).requiresInitialization) {
      await this.initializeInstance(providerId, channelId)
    }
  }
}
