import { HealthEventType, uuid } from '@botpress/messaging-base'
import { ConduitEvents } from '../conduits/events'
import { ConduitService } from '../conduits/service'
import { InstanceLifetimeEvents } from '../instances/lifetime/events'
import { InstanceService } from '../instances/service'
import { HealthService } from './service'

export class HealthListener {
  constructor(
    private conduitService: ConduitService,
    private instanceService: InstanceService,
    private healthService: HealthService
  ) {}

  async setup() {
    this.conduitService.events.on(ConduitEvents.Created, this.handleConduitCreated.bind(this), true)
    this.conduitService.events.on(ConduitEvents.Updated, this.handleConduitUpdated.bind(this), true)
    this.conduitService.events.on(ConduitEvents.Deleting, this.handleConduitDeleting.bind(this), true)
    this.instanceService.lifetimes.events.on(InstanceLifetimeEvents.Setup, this.handleInstanceSetup.bind(this))
    this.instanceService.lifetimes.events.on(
      InstanceLifetimeEvents.SetupFailed,
      this.handleInstanceSetupFailed.bind(this)
    )
    this.instanceService.lifetimes.events.on(
      InstanceLifetimeEvents.Initialized,
      this.handleInstanceInitialized.bind(this)
    )
    this.instanceService.lifetimes.events.on(
      InstanceLifetimeEvents.InitializationFailed,
      this.handleInstanceInitializationFailed.bind(this)
    )
    this.instanceService.lifetimes.events.on(InstanceLifetimeEvents.Destroyed, this.handleInstanceDestroyed.bind(this))
  }

  private async handleConduitCreated(conduitId: uuid) {
    await this.healthService.register(conduitId, HealthEventType.Create)
    await this.healthService.register(conduitId, HealthEventType.Configure)
  }

  private async handleConduitUpdated(conduitId: uuid) {
    await this.healthService.register(conduitId, HealthEventType.Configure)
  }

  private async handleConduitDeleting(conduitId: uuid) {
    await this.healthService.register(conduitId, HealthEventType.Delete)
  }

  private async handleInstanceSetup(conduitId: uuid) {
    await this.healthService.register(conduitId, HealthEventType.Start)
  }

  private async handleInstanceSetupFailed(conduitId: uuid) {
    await this.healthService.register(conduitId, HealthEventType.StartFailure)
  }

  private async handleInstanceInitialized(conduitId: uuid) {
    await this.healthService.register(conduitId, HealthEventType.Initialize)
  }

  private async handleInstanceInitializationFailed(conduitId: uuid) {
    await this.healthService.register(conduitId, HealthEventType.InitializeFailure)
  }

  private async handleInstanceDestroyed(conduitId: uuid) {
    // It's possible that this gets called by the cleared cached after the conduit was deleted from the db
    if (await this.conduitService.fetch(conduitId)) {
      try {
        await this.healthService.register(conduitId, HealthEventType.Sleep)
      } catch {
        // TODO: doesn't fully solve the problem. Because of some race condition it can happen that the insert happens after the delete
      }
    }
  }
}
