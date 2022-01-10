import { uuid } from '@botpress/messaging-base'
import { DispatchService, Logger, Service, DistributedService } from '@botpress/messaging-engine'
import { ChannelService } from '../../channels/service'
import { ConduitService } from '../../conduits/service'
import { ProviderService } from '../../providers/service'
import { StatusService } from '../../status/service'
import { InstanceDispatcher, InstanceDispatches } from './dispatch'
import { InstanceLifetimeEmitter, InstanceLifetimeEvents, InstanceLifetimeWatcher } from './events'

export class InstanceLifetimeService extends Service {
  get events(): InstanceLifetimeWatcher {
    return this.emitter
  }

  private emitter: InstanceLifetimeEmitter
  private dispatcher!: InstanceDispatcher

  constructor(
    private distributedService: DistributedService,
    private dispatchService: DispatchService,
    private channelService: ChannelService,
    private providerService: ProviderService,
    private conduitService: ConduitService,
    private statusService: StatusService,
    private logger: Logger
  ) {
    super()
    this.emitter = new InstanceLifetimeEmitter()
  }

  async setup() {
    this.dispatcher = await this.dispatchService.create('dispatch_converse', InstanceDispatcher)
    this.dispatcher.on(InstanceDispatches.Stop, this.handleDispatchStop.bind(this))
  }

  async initialize(conduitId: uuid) {
    await this.start(conduitId)

    const conduit = await this.conduitService.get(conduitId)
    const provider = await this.providerService.getById(conduit.providerId)
    const channel = this.channelService.getById(conduit.channelId)

    try {
      await this.distributedService.using(`lock_dyn_instance_init::${conduitId}`, async () => {
        await channel.initialize(provider.name)
      })
    } catch (e) {
      await this.statusService.addError(conduitId, e as Error)
      this.logger.error(e, 'Error trying to initialize conduit', provider.name)
      return this.emitter.emit(InstanceLifetimeEvents.InitializationFailed, conduitId)
    }

    await this.statusService.updateInitializedOn(conduitId, new Date())
    await this.statusService.clearErrors(conduitId)
    return this.emitter.emit(InstanceLifetimeEvents.Initialized, conduitId)
  }

  async start(conduitId: uuid) {
    const conduit = await this.conduitService.get(conduitId)
    const provider = await this.providerService.getById(conduit.providerId)
    const channel = this.channelService.getById(conduit.channelId)

    if (channel.has(provider.name)) {
      return
    }

    try {
      await this.distributedService.using(`lock_dyn_instance_setup::${conduitId}`, async () => {
        await channel.start(provider.name, conduit.config)
        await this.dispatcher.subscribe(conduitId)
      })
      await this.emitter.emit(InstanceLifetimeEvents.Setup, conduitId)
    } catch (e) {
      await this.statusService.addError(conduitId, e as Error)
      this.logger.error(e, 'Error trying to setup conduit', provider.name)
      await this.emitter.emit(InstanceLifetimeEvents.SetupFailed, conduitId)
    }
  }

  async stop(conduitId: uuid) {
    await this.dispatcher.publish(InstanceDispatches.Stop, conduitId, {})
  }

  private async handleDispatchStop(conduitId: uuid) {
    const conduit = await this.conduitService.get(conduitId)
    const provider = await this.providerService.getById(conduit.providerId)
    const channel = this.channelService.getById(conduit.channelId)

    if (!channel.has(provider.name)) {
      return
    }

    try {
      await channel.stop(provider.name)
      await this.emitter.emit(InstanceLifetimeEvents.Destroyed, conduitId)
    } catch (e) {
      this.logger.error(e, 'Error trying to destroy conduit')
    } finally {
      await this.dispatcher.unsubscribe(conduitId)
    }
  }
}
