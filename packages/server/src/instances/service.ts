import {
  CachingService,
  DispatchService,
  DistributedService,
  Logger,
  LoggerService,
  Service
} from '@botpress/messaging-engine'
import { ChannelService } from '../channels/service'
import { ClientService } from '../clients/service'
import { ConduitService } from '../conduits/service'
import { ConversationService } from '../conversations/service'
import { MappingService } from '../mapping/service'
import { MessageService } from '../messages/service'
import { ProviderService } from '../providers/service'
import { ProvisionService } from '../provisions/service'
import { StatusService } from '../status/service'
import { InstanceClearingService } from './clearing/service'
import { InstanceInvalidationService } from './invalidation/service'
import { InstanceLifetimeService } from './lifetime/service'
import { InstanceMessagingService } from './messaging/service'
import { InstanceMonitoringService } from './monitoring/service'
import { InstanceSandboxService } from './sandbox/service'

export class InstanceService extends Service {
  messaging: InstanceMessagingService
  lifetimes: InstanceLifetimeService
  invalidation: InstanceInvalidationService
  clearing: InstanceClearingService
  monitoring: InstanceMonitoringService
  sandbox: InstanceSandboxService

  private logger: Logger

  constructor(
    private loggers: LoggerService,
    private distributed: DistributedService,
    private dispatches: DispatchService,
    private caching: CachingService,
    private channels: ChannelService,
    private providers: ProviderService,
    private provisions: ProvisionService,
    private conduits: ConduitService,
    private conversations: ConversationService,
    private messages: MessageService,
    private clients: ClientService,
    private mapping: MappingService,
    private status: StatusService
  ) {
    super()
    this.logger = this.loggers.root.sub('instances')

    this.messaging = new InstanceMessagingService(
      this.caching,
      this.channels,
      this.providers,
      this.provisions,
      this.conduits,
      this.conversations,
      this.messages,
      this.mapping,
      this.logger
    )
    this.lifetimes = new InstanceLifetimeService(
      this.distributed,
      this.dispatches,
      this.channels,
      this.providers,
      this.conduits,
      this.status,
      this.logger
    )
    this.invalidation = new InstanceInvalidationService(
      this.channels,
      this.providers,
      this.conduits,
      this.status,
      this.lifetimes
    )
    this.clearing = new InstanceClearingService(caching, channels, providers, conduits, this.lifetimes, this.logger)
    this.monitoring = new InstanceMonitoringService(
      this.distributed,
      this.channels,
      this.conduits,
      this.status,
      this.lifetimes,
      this.logger
    )
    this.sandbox = new InstanceSandboxService(this.clients, this.mapping, this.messaging)
  }

  async setup() {
    await this.messaging.setup()
    await this.lifetimes.setup()
    await this.invalidation.setup()
    await this.clearing.setup()
    await this.sandbox.setup()
  }

  async monitor() {
    await this.monitoring.setup()
  }

  async destroy() {
    await this.monitoring.destroy()
    await this.clearing.destroy()
    await this.lifetimes.destroy()
  }
}
