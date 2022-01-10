import { CachingService, Logger, ServerCache2D, Service } from '@botpress/messaging-engine'
import ms from 'ms'
import { ChannelService } from '../../channels/service'
import { ConduitService } from '../../conduits/service'
import { ProviderService } from '../../providers/service'
import { InstanceLifetimeService } from '../lifetime/service'

export class InstanceClearingService extends Service {
  private destroyed: boolean
  private channelStateCache!: ServerCache2D<any>
  private channelStateDeleting!: { [key: string]: any }

  constructor(
    private cachingService: CachingService,
    private channelService: ChannelService,
    private providerService: ProviderService,
    private conduitService: ConduitService,
    private instanceLifetime: InstanceLifetimeService,
    private logger: Logger
  ) {
    super()
    this.destroyed = false
  }

  public async setup() {
    this.channelStateCache = await this.cachingService.newServerCache2D('cache_channel_states', {
      dispose: async (k, v) => {
        if (!this.destroyed) {
          this.channelStateDeleting[k] = v
          await this.handleCacheDispose(k)
        }
      },
      max: 50000,
      maxAge: ms('10s')
    })
    this.channelStateDeleting = {}

    setInterval(() => {
      this.channelStateCache.prune()
    }, ms('2s'))

    for (const channel of this.channelService.list()) {
      channel.stateManager({
        set: (providerName, val) => this.channelStateCache.set(channel.meta.id, providerName, val),
        get: (providerName) => {
          return (
            this.channelStateCache.get(channel.meta.id, providerName) ||
            this.channelStateDeleting[this.channelStateCache.getKey(channel.meta.id, providerName)]
          )
        },
        del: (providerName) => this.channelStateCache.del(channel.meta.id, providerName)
      })
    }
  }

  async destroy() {
    this.destroyed = true
  }

  private async handleCacheDispose(key: string) {
    try {
      const [channelId, providerName] = this.channelStateCache.getValues(key)
      const provider = await this.providerService.getByName(providerName)
      const conduit = await this.conduitService.getByProviderAndChannel(provider.id, channelId)

      await this.instanceLifetime.stop(conduit.id)
      delete this.channelStateDeleting[key]
    } catch (e) {
      this.logger.error(e, 'Error trying to clear channel')
    }
  }
}
