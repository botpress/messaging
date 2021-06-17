import _ from 'lodash'
import { App } from '../app'
import { Service } from '../base/service'
import { uuid } from '../base/types'
import { ServerCache } from '../caching/cache'
import { CachingService } from '../caching/service'
import { ConduitInstance } from '../channels/base/conduit'
import { ChannelService } from '../channels/service'
import { ClientService } from '../clients/service'
import { ConduitDeletingEvent, ConduitEvents, ConduitUpdatingEvent } from '../conduits/events'
import { ConduitService } from '../conduits/service'
import { ProviderService } from '../providers/service'

export class InstanceService extends Service {
  private cacheByName!: ServerCache<string, ConduitInstance<any, any>>
  private cacheById!: ServerCache<uuid, ConduitInstance<any, any>>

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
    this.cacheByName = await this.cachingService.newServerCache('cache_instance_by_provider_name')
    this.cacheById = await this.cachingService.newServerCache('cache_instance_by_provider_id')

    this.conduitService.events().on(ConduitEvents.Deleting, this.onConduitDeleting.bind(this))
    this.conduitService.events().on(ConduitEvents.Updating, this.onConduitUpdating.bind(this))
  }

  async onConduitDeleting({ providerId, channelId }: ConduitDeletingEvent) {
    const provider = await this.providerService.getById(providerId)

    this.cacheById.del(this.getCacheKey(providerId, channelId))
    this.cacheByName.del(this.getCacheKey(provider!.name, channelId))
  }

  async onConduitUpdating({ providerId, channelId }: ConduitUpdatingEvent) {
    const provider = await this.providerService.getById(providerId)

    this.cacheById.del(this.getCacheKey(providerId, channelId))
    this.cacheByName.del(this.getCacheKey(provider!.name, channelId))
  }

  async getInstanceByProviderName(providerName: string, channelId: uuid): Promise<ConduitInstance<any, any>> {
    const cached = this.cacheByName.get(this.getCacheKey(providerName, channelId))
    if (cached) {
      return cached
    }

    const provider = (await this.providerService.getByName(providerName))!
    return this.getInstanceByProviderId(provider.id, channelId)
  }

  async getInstanceByProviderId(providerId: uuid, channelId: uuid): Promise<ConduitInstance<any, any>> {
    const cached = this.cacheById.get(providerId)
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

    this.cacheById.set(this.getCacheKey(provider.id, channelId), instance)
    this.cacheByName.set(this.getCacheKey(provider.name, channelId), instance)

    return instance
  }

  private getCacheKey(providerId: uuid, channelId: uuid) {
    return `${providerId}-${channelId}`
  }
}
