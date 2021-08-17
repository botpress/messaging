import { uuid } from '@botpress/messaging-base'
import _ from 'lodash'
import ms from 'ms'
import yn from 'yn'
import { App } from '../app'
import { Service } from '../base/service'
import { ServerCache } from '../caching/cache'
import { CachingService } from '../caching/service'
import { ConduitInstance } from '../channels/base/conduit'
import { ChannelService } from '../channels/service'
import { ClientService } from '../clients/service'
import { ConduitService } from '../conduits/service'
import { DistributedService } from '../distributed/service'
import { LoggerService } from '../logger/service'
import { Logger } from '../logger/types'
import { MappingService } from '../mapping/service'
import { ProviderService } from '../providers/service'
import { InstanceEmitter, InstanceEvents, InstanceWatcher } from './events'
import { InstanceInvalidator } from './invalidator'
import { InstanceMonitoring } from './monitoring'
import { InstanceSandbox } from './sandbox'

export class InstanceService extends Service {
  get events(): InstanceWatcher {
    return this.emitter
  }

  private destroyed: boolean
  private emitter: InstanceEmitter
  private invalidator: InstanceInvalidator
  private monitoring: InstanceMonitoring
  private sandbox: InstanceSandbox
  private cache!: ServerCache<uuid, ConduitInstance<any, any>>
  private failures: { [conduitId: string]: number } = {}
  private logger: Logger
  private lazyLoadingEnabled!: boolean

  constructor(
    private loggerService: LoggerService,
    private distributedService: DistributedService,
    private cachingService: CachingService,
    private channelService: ChannelService,
    private providerService: ProviderService,
    private conduitService: ConduitService,
    private clientService: ClientService,
    private mappingService: MappingService,
    private app: App
  ) {
    super()
    this.destroyed = false
    this.emitter = new InstanceEmitter()
    this.invalidator = new InstanceInvalidator(
      this.channelService,
      this.providerService,
      this.conduitService,
      this.clientService,
      this
    )
    this.logger = this.loggerService.root.sub('instances')
    this.monitoring = new InstanceMonitoring(
      this.logger.sub('monitoring'),
      this.distributedService,
      this.channelService,
      this.conduitService,
      this,
      this.failures
    )
    this.sandbox = new InstanceSandbox(this.clientService, this.mappingService, this)
  }

  async setup() {
    this.lazyLoadingEnabled = !yn(process.env.NO_LAZY_LOADING)

    this.cache = await this.cachingService.newServerCache('cache_instance_by_conduit_id', {
      dispose: async (k, v) => {
        if (!this.destroyed) {
          await this.handleCacheDispose(k, v)
        }
      },
      max: 50000,
      maxAge: ms('30min')
    })

    await this.invalidator.setup(this.cache, this.failures)
  }

  private async handleCacheDispose(conduitId: uuid, instance: ConduitInstance<any, any>) {
    try {
      await instance.destroy()
      await this.emitter.emit(InstanceEvents.Destroyed, conduitId)
    } catch (e) {
      this.logger.error(e, 'Error trying to destroy conduit')
    }
  }

  async destroy() {
    this.destroyed = true

    if (!this.cache) {
      return
    }

    for (const conduitId of this.cache.keys()) {
      const instance = this.cache.get(conduitId)!
      await this.handleCacheDispose(conduitId, instance)
    }
  }

  async monitor() {
    await this.monitoring.monitor()
  }

  async initialize(conduitId: uuid) {
    const instance = await this.get(conduitId)

    try {
      await this.distributedService.using(`lock_dyn_instance_init::${conduitId}`, async () => {
        await instance.initialize()
      })
    } catch (e) {
      this.cache.del(conduitId)

      // TODO: replace by StatusService
      instance.logger.error(e, 'Error trying to initialize conduit')
      if (!this.failures[conduitId]) {
        this.failures[conduitId] = 0
      }
      this.failures[conduitId]++

      return this.emitter.emit(InstanceEvents.InitializationFailed, conduitId)
    }

    await this.conduitService.updateInitialized(conduitId)
    return this.emitter.emit(InstanceEvents.Initialized, conduitId)
  }

  async get(conduitId: uuid): Promise<ConduitInstance<any, any>> {
    const cached = this.cache.get(conduitId)
    if (cached) {
      return cached
    }

    const conduit = (await this.conduitService.get(conduitId))!
    const channel = this.channelService.getById(conduit.channelId)
    const instance = channel.createConduit()

    try {
      await this.distributedService.using(`lock_dyn_instance_setup::${conduitId}`, async () => {
        await instance.setup(conduitId, conduit.config, this.app)
      })
      this.cache.set(conduitId, instance, channel.lazy && this.lazyLoadingEnabled ? undefined : Infinity)

      await this.emitter.emit(InstanceEvents.Setup, conduitId)
    } catch (e) {
      this.cache.del(conduitId)
      await this.emitter.emit(InstanceEvents.SetupFailed, conduitId)

      // TODO: replace by StatusService
      instance.logger.error(e, 'Error trying to setup conduit')
      if (!this.failures[conduitId]) {
        this.failures[conduitId] = 0
      }
      this.failures[conduitId]++
    }

    return instance
  }
}
