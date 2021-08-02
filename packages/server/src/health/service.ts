import clc from 'cli-color'
import { Service } from '../base/service'
import { uuid } from '../base/types'
import { ChannelService } from '../channels/service'
import { ClientService } from '../clients/service'
import { ConduitService } from '../conduits/service'
import { DatabaseService } from '../database/service'
import { InstanceService } from '../instances/service'
import { Logger } from '../logger/types'
import { ProviderService } from '../providers/service'
import { HealthTable } from './table'
import { HealthEventType } from './types'
import { HealthWatcher } from './watcher'

export class HealthService extends Service {
  private table: HealthTable
  private watcher: HealthWatcher
  private logger = new Logger('Health')

  constructor(
    private db: DatabaseService,
    private channelService: ChannelService,
    private providerService: ProviderService,
    private clientService: ClientService,
    private conduitService: ConduitService,
    private instanceService: InstanceService
  ) {
    super()
    this.table = new HealthTable()
    this.watcher = new HealthWatcher(this.conduitService, this.instanceService, this)
  }

  async setup() {
    await this.db.registerTable(this.table)

    await this.watcher.setup()
  }

  async register(conduitId: uuid, type: HealthEventType, info: any = undefined) {
    const conduit = await this.conduitService.get(conduitId)
    const provider = await this.providerService.getById(conduit!.providerId)
    const channel = this.channelService.getById(conduit!.channelId)

    this.logger.info(`[${provider!.name}] ${clc.bold(channel.name)} ${type}`)
  }

  async getHealth(clientId: uuid) {
    const client = await this.clientService.getById(clientId)
    const provider = await this.providerService.getById(client!.providerId)
    const conduits = await this.conduitService.listByProvider(provider!.id)

    const channels: any = {}

    for (const conduit of conduits) {
      const channel = this.channelService.getById(conduit.channelId)
      channels[channel.name] = { initialized: conduit.initialized }
    }

    return {
      channels
    }
  }
}
