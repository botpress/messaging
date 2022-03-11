import { SyncChannels, SyncRequest, SyncResult, SyncWebhook, uuid } from '@botpress/messaging-base'
import { DistributedService, Logger, LoggerService, Service } from '@botpress/messaging-engine'
import _ from 'lodash'
import yn from 'yn'
import { ChannelService } from '../channels/service'
import { ClientService } from '../clients/service'
import { ConduitService } from '../conduits/service'
import { ProvisionService } from '../provisions/service'
import { StatusService } from '../status/service'
import { WebhookService } from '../webhooks/service'

export class SyncService extends Service {
  private logger: Logger

  constructor(
    private loggers: LoggerService,
    private distributed: DistributedService,
    private channels: ChannelService,
    private conduits: ConduitService,
    private clients: ClientService,
    private provisions: ProvisionService,
    private webhooks: WebhookService,
    private status: StatusService
  ) {
    super()
    this.logger = this.loggers.root.sub('sync')
  }

  async setup() {
    // TODO: reimplement sync calls from env vars (for sandbox)
  }

  async sync(clientId: uuid, req: SyncRequest): Promise<SyncResult> {
    let result: SyncResult

    await this.distributed.using(`lock_dyn_sync_client::${clientId}`, async () => {
      if (yn(process.env.LOGGING_ENABLED)) {
        this.logger.info(`[${clientId}] sync`)
      }

      const client = await this.clients.getById(clientId)
      const provision = await this.provisions.getByClientId(clientId)
      await this.syncConduits(provision.providerId, req.channels || {})
      const webhooks = await this.syncWebhooks(client.id, req.webhooks || [])

      result = { webhooks }
    })

    return result!
  }

  private async syncConduits(providerId: uuid, conduits: SyncChannels) {
    const oldConduits = [...(await this.conduits.listByProvider(providerId))]

    for (const [channel, configWithVersion] of Object.entries(conduits)) {
      const channelId = this.channels.getByNameAndVersion(channel, configWithVersion.version).meta.id
      const config = _.omit(configWithVersion, 'version')
      const oldConduitIndex = oldConduits.findIndex((x) => x.channelId === channelId)

      if (oldConduitIndex < 0) {
        await this.conduits.create(providerId, channelId, config)
      } else {
        const oldConduit = await this.conduits.getByProviderAndChannel(providerId, channelId)

        if (!_.isEqual(config, oldConduit.config)) {
          await this.conduits.updateConfig(oldConduit.id, config)
        } else {
          // updating the config will clear the number of errors.
          // But if the config is identical we still want to clear it
          const status = await this.status.fetch(oldConduit.id)
          if (status?.numberOfErrors) {
            await this.status.clearErrors(oldConduit.id)
          }
        }

        oldConduits.splice(oldConduitIndex, 1)
      }
    }

    for (const unusedConduit of oldConduits) {
      await this.conduits.delete(unusedConduit.id)
    }
  }

  private async syncWebhooks(clientId: uuid, webhooks: SyncWebhook[]): Promise<SyncWebhook[]> {
    const webhooksWithTokens: SyncWebhook[] = []
    const oldWebhooks = [...(await this.webhooks.list(clientId))]

    for (const webhook of webhooks) {
      const oldWebhookIndex = oldWebhooks.findIndex((x) => x.url === webhook.url)

      if (oldWebhookIndex < 0) {
        const token = await this.webhooks.generateToken()
        const newToken = await this.webhooks.create(clientId, token, webhook.url)
        webhooksWithTokens.push({ url: newToken.url, token: newToken.token })
      } else {
        const oldWebhook = oldWebhooks[oldWebhookIndex]
        webhooksWithTokens.push({ url: oldWebhook.url, token: oldWebhook.token })
        oldWebhooks.splice(oldWebhookIndex, 1)
      }
    }

    for (const unusedWebhook of oldWebhooks) {
      await this.webhooks.delete(unusedWebhook.id)
    }

    return webhooksWithTokens
  }
}
