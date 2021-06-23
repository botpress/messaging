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
import { ConduitService } from '../conduits/service'
import { ProviderService } from '../providers/service'
import { InstanceInvalidator } from './invalidator'
import { InstanceMonitoring } from './monitoring'

export class InstanceService extends Service {
  private invalidator: InstanceInvalidator
  private monitoring: InstanceMonitoring
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
    this.invalidator = new InstanceInvalidator(
      this.channelService,
      this.providerService,
      this.conduitService,
      this.clientService,
      this
    )
    this.monitoring = new InstanceMonitoring(this.channelService, this.conduitService, this)
  }

  async setup() {
    this.cache = await this.cachingService.newServerCache('cache_instance_by_provider_id', {
      dispose: async (k, v) => {
        await v.destroy()
      },
      max: 50000,
      maxAge: ms('30min')
    })

    await this.invalidator.setup(this.cache)
    await this.monitoring.setup()
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
}
