import { uuid } from '../base/types'
import { ConduitEvents } from '../conduits/events'
import { ConduitService } from '../conduits/service'
import { InstanceEvents } from '../instances/events'
import { InstanceService } from '../instances/service'
import { HealthService } from './service'
import { HealthEventType } from './types'

export class HealthWatcher {
  constructor(
    private conduitService: ConduitService,
    private instanceService: InstanceService,
    private healthService: HealthService
  ) {}

  async setup() {
    this.conduitService.events.on(ConduitEvents.Created, this.handleConduitCreated.bind(this), true)
    this.conduitService.events.on(ConduitEvents.Updated, this.handleConduitUpdated.bind(this), true)
    this.conduitService.events.on(ConduitEvents.Deleting, this.handleConduitDeleted.bind(this), true)
    this.instanceService.events.on(InstanceEvents.Setup, this.handleInstanceSetup.bind(this))
    this.instanceService.events.on(InstanceEvents.SetupFailed, this.handleInstanceSetupFailed.bind(this))
    this.instanceService.events.on(InstanceEvents.Initialized, this.handleInstanceInitialized.bind(this))
    this.instanceService.events.on(
      InstanceEvents.InitializationFailed,
      this.handleInstanceInitializationFailed.bind(this)
    )
    this.instanceService.events.on(InstanceEvents.Destroyed, this.handleInstanceDestroyed.bind(this))
  }

  private async handleConduitCreated(conduitId: uuid) {
    await this.healthService.register(conduitId, HealthEventType.Create)
  }

  private async handleConduitUpdated(conduitId: uuid) {
    await this.healthService.register(conduitId, HealthEventType.Configure)
  }

  private async handleConduitDeleted(conduitId: uuid) {
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
    await this.healthService.register(conduitId, HealthEventType.Sleep)
  }
}
