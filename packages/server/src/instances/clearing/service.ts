import { CachingService, Logger, ServerCache2D, Service } from '@botpress/messaging-engine'
import ms from 'ms'
import { ChannelService } from '../../channels/service'
import { ConduitService } from '../../conduits/service'
import { ProviderService } from '../../providers/service'
import { InstanceLifetimeService } from '../lifetime/service'

export class InstanceClearingService extends Service {
  private destroyed: boolean
  private statesCache!: ServerCache2D<any>
  private statesDeleting!: { [key: string]: any }

  constructor(
    private caching: CachingService,
    private channels: ChannelService,
    private providers: ProviderService,
    private conduits: ConduitService,
    private lifetimes: InstanceLifetimeService,
    private logger: Logger
  ) {
    super()
    this.destroyed = false
  }

  public async setup() {
    this.statesCache = await this.caching.newServerCache2D('cache_channel_states', {
      dispose: async (k, v) => {
        if (!this.destroyed) {
          this.statesDeleting[k] = v
          await this.handleCacheDispose(k)
        }
      },
      max: 50000,
      maxAge: ms('30min')
    })
    this.statesDeleting = {}

    for (const channel of this.channels.list()) {
      channel.stateManager({
        set: (providerName, val) => this.statesCache.set(channel.meta.id, providerName, val),
        get: (providerName) => {
          return (
            this.statesCache.get(channel.meta.id, providerName) ||
            this.statesDeleting[this.statesCache.getKey(channel.meta.id, providerName)]
          )
        },
        del: (providerName) => this.statesCache.del(channel.meta.id, providerName)
      })
    }
  }

  async destroy() {
    this.destroyed = true
  }

  private async handleCacheDispose(key: string) {
    try {
      const [channelId, providerName] = this.statesCache.getValues(key)
      const provider = await this.providers.getByName(providerName)
      const conduit = await this.conduits.getByProviderAndChannel(provider.id, channelId)

      await this.lifetimes.stop(conduit.id)
    } catch (e) {
      this.logger.error(e, 'Error trying to clear channel')
    } finally {
      delete this.statesDeleting[key]
    }
  }
}
