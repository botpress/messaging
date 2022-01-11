import { uuid } from '@botpress/messaging-base'
import { Channel } from '@botpress/messaging-channels'
import { DispatchService, Logger, Service, DistributedService } from '@botpress/messaging-engine'
import { ChannelService } from '../../channels/service'
import { ConduitService } from '../../conduits/service'
import { ProviderService } from '../../providers/service'
import { StatusService } from '../../status/service'
import { InstanceLifetimeDispatcher, InstanceLifetimeDispatches } from './dispatch'
import { InstanceLifetimeEmitter, InstanceLifetimeEvents, InstanceLifetimeWatcher } from './events'

export const MAX_ALLOWED_FAILURES = 5

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
      channel.autoStart(async (providerName) => this.handleAutoStart(channel, providerName))
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
    const started = await this.start(conduitId)
    if (!started) {
      return false
    }

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

      await this.emitter.emit(InstanceLifetimeEvents.InitializationFailed, conduitId)
      await this.stop(conduitId)
      return false
    }

    await this.status.updateInitializedOn(conduitId, new Date())
    await this.status.clearErrors(conduitId)
    await this.emitter.emit(InstanceLifetimeEvents.Initialized, conduitId)
    return true
  }

  async start(conduitId: uuid) {
    const conduit = await this.conduits.get(conduitId)
    const provider = await this.providers.getById(conduit.providerId)
    const channel = this.channels.getById(conduit.channelId)

    if (channel.has(provider.name)) {
      return true
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
      return false
    }

    return true
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

  private async handleAutoStart(channel: Channel, providerName: string) {
    const provider = await this.providers.getByName(providerName)
    const conduit = await this.conduits.getByProviderAndChannel(provider.id, channel.meta.id)

    const status = await this.status.fetch(conduit.id)
    if ((status?.numberOfErrors || 0) >= MAX_ALLOWED_FAILURES) {
      throw new Error('Cannot auto start conduit since it is in an errored state')
    }

    if (!status?.initializedOn && channel.meta.initiable) {
      const initialized = await this.initialize(conduit.id)
      if (!initialized) {
        throw new Error('Failed to auto initialize conduit')
      }
    } else {
      const started = await this.start(conduit.id)
      if (!started) {
        throw new Error('Failed to auto start conduit')
      }
    }
  }
}
