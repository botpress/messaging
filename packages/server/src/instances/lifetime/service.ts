import { uuid } from '@botpress/messaging-base'
import { DispatchService, Logger, Service, DistributedService } from '@botpress/messaging-engine'
import { ChannelService } from '../../channels/service'
import { ConduitService } from '../../conduits/service'
import { ProviderService } from '../../providers/service'
import { StatusService } from '../../status/service'
import { InstanceLifetimeDispatcher, InstanceLifetimeDispatches } from './dispatch'
import { InstanceLifetimeEmitter, InstanceLifetimeEvents, InstanceLifetimeWatcher } from './events'

export class InstanceLifetimeService extends Service {
  get events(): InstanceLifetimeWatcher {
    return this.emitter
  }

  private emitter: InstanceLifetimeEmitter
  private dispatcher!: InstanceLifetimeDispatcher

  constructor(
    private distributed: DistributedService,
    private dispatches: DispatchService,
    private channels: ChannelService,
    private providers: ProviderService,
    private conduits: ConduitService,
    private status: StatusService,
    private logger: Logger
  ) {
    super()
    this.emitter = new InstanceLifetimeEmitter()
  }

  async setup() {
    this.dispatcher = await this.dispatches.create('dispatch_converse', InstanceLifetimeDispatcher)
    this.dispatcher.on(InstanceLifetimeDispatches.Stop, this.handleDispatchStop.bind(this))

    for (const channel of this.channels.list()) {
      channel.autoStart(async (providerName) => {
        const provider = await this.providers.getByName(providerName)
        const conduit = await this.conduits.getByProviderAndChannel(provider.id, channel.meta.id)

        await this.start(conduit.id)
      })
    }
  }

  async destroy() {
    for (const channel of this.channels.list()) {
      for (const scope of channel.scopes) {
        const provider = await this.providers.getByName(scope)
        const conduit = await this.conduits.getByProviderAndChannel(provider.id, channel.meta.id)

        await this.stop(conduit.id)
      }
    }
  }

  async initialize(conduitId: uuid) {
    await this.start(conduitId)

    const conduit = await this.conduits.get(conduitId)
    const provider = await this.providers.getById(conduit.providerId)
    const channel = this.channels.getById(conduit.channelId)

    try {
      await this.distributed.using(`lock_dyn_instance_init::${conduitId}`, async () => {
        await channel.initialize(provider.name)
      })
    } catch (e) {
      await this.status.addError(conduitId, e as Error)
      this.logger.error(e, 'Error trying to initialize conduit', provider.name)
      return this.emitter.emit(InstanceLifetimeEvents.InitializationFailed, conduitId)
    }

    await this.status.updateInitializedOn(conduitId, new Date())
    await this.status.clearErrors(conduitId)
    return this.emitter.emit(InstanceLifetimeEvents.Initialized, conduitId)
  }

  async start(conduitId: uuid) {
    const conduit = await this.conduits.get(conduitId)
    const provider = await this.providers.getById(conduit.providerId)
    const channel = this.channels.getById(conduit.channelId)

    if (channel.has(provider.name)) {
      return
    }

    try {
      await this.distributed.using(`lock_dyn_instance_setup::${conduitId}`, async () => {
        await channel.start(provider.name, conduit.config)
        await this.dispatcher.subscribe(conduitId)
      })
      await this.emitter.emit(InstanceLifetimeEvents.Setup, conduitId)
    } catch (e) {
      await this.status.addError(conduitId, e as Error)
      this.logger.error(e, 'Error trying to setup conduit', provider.name)
      await this.emitter.emit(InstanceLifetimeEvents.SetupFailed, conduitId)
    }
  }

  async stop(conduitId: uuid) {
    await this.dispatcher.publish(InstanceLifetimeDispatches.Stop, conduitId, {})
  }

  private async handleDispatchStop(conduitId: uuid) {
    const conduit = await this.conduits.get(conduitId)
    const provider = await this.providers.getById(conduit.providerId)
    const channel = this.channels.getById(conduit.channelId)

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
