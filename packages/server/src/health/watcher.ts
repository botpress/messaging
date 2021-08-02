import { uuid } from '../base/types'
import { ConduitEvents } from '../conduits/events'
import { ConduitService } from '../conduits/service'
import { InstanceEvents } from '../instances/events'
import { InstanceService } from '../instances/service'
import { HealthService } from './service'

export class HealthWatcher {
  constructor(
    private conduitService: ConduitService,
    private instanceService: InstanceService,
    private healthService: HealthService
  ) {}

  async setup() {
    this.conduitService.events.on(ConduitEvents.Updated, this.handleConduitUpdated.bind(this))
    this.instanceService.events.on(InstanceEvents.Setup, this.handleInstanceSetup.bind(this))
    this.instanceService.events.on(InstanceEvents.SetupFailed, this.handleInstanceSetupFailed.bind(this))
    this.instanceService.events.on(InstanceEvents.Initialized, this.handleInstanceInitialized.bind(this))
    this.instanceService.events.on(
      InstanceEvents.InitializationFailed,
      this.handleInstanceInitializationFailed.bind(this)
    )
    this.instanceService.events.on(InstanceEvents.Destroyed, this.handleInstanceDestroyed.bind(this))
  }

  private async handleConduitUpdated(conduitId: uuid) {
    console.log('conduit updated!', conduitId)
  }

  private async handleInstanceSetup(conduitId: uuid) {
    console.log('conduit setup!', conduitId)
  }

  private async handleInstanceSetupFailed(conduitId: uuid) {
    console.log('conduit setup failed!', conduitId)
  }

  private async handleInstanceInitialized(conduitId: uuid) {
    console.log('conduit initialized!', conduitId)
  }

  private async handleInstanceInitializationFailed(conduitId: uuid) {
    console.log('conduit initialization failed!', conduitId)
  }

  private async handleInstanceDestroyed(conduitId: uuid) {
    console.log('conduit destroyed!', conduitId)
  }
}
