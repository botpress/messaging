import { Service } from '../base/service'
import { ChannelService } from '../channels/service'
import { ClientService } from '../clients/service'
import { Client } from '../clients/types'
import { ConduitService } from '../conduits/service'
import { ConfigService } from '../config/service'
import { ProviderService } from '../providers/service'
import { Provider } from '../providers/types'
import { WebhookService } from '../webhooks/service'
import { SyncRequest, SyncResult } from './types'

export class SyncService extends Service {
  constructor(
    private config: ConfigService,
    private channels: ChannelService,
    private providers: ProviderService,
    private conduits: ConduitService,
    private clients: ClientService,
    private webhooks: WebhookService
  ) {
    super()
  }

  async setup() {
    for (const sync of this.config.current.sync || []) {
      await this.sync(sync, true)
    }
  }

  async sync(sync: SyncRequest, force: boolean): Promise<SyncResult> {
    // TODO: refactor this whole function

    let provider: Provider | undefined = undefined

    if (sync.providerName) {
      provider = await this.providers.getByName(sync.providerName)
    }
    if (!provider) {
      provider = await this.providers.create(undefined, sync.providerName)
    }

    const oldConduits = [...(await this.conduits.list(provider.id))]

    for (const [channel, config] of Object.entries(sync.conduits || {})) {
      const channelId = this.channels.getByName(channel).id
      const conduitIndex = oldConduits.findIndex((x) => x.channelId === channelId)

      if (conduitIndex >= 0) {
        oldConduits.splice(conduitIndex, 1)
        await this.conduits.updateConfig(provider.id, channelId, config)
      } else {
        await this.conduits.create(provider.id, channelId, config)
      }
    }

    for (const unusedConduit of oldConduits) {
      await this.conduits.delete(provider.id, unusedConduit.channelId)
    }

    let client: Client | undefined = undefined
    let token: string | undefined = undefined

    if (sync.clientId) {
      client = await this.clients.getById(sync.clientId)
    }

    if (!client) {
      await this.clients.unlinkAllFromProvider(provider.id)

      if (force && sync.clientToken) {
        token = sync.clientToken
      } else {
        token = await this.clients.generateToken()
      }

      client = await this.clients.create(provider.id, token, force ? sync.clientId : undefined)
    } else if (client.providerId !== provider.id) {
      await this.clients.updateProvider(client.id, provider.id)
    }

    const oldWebhooks = [...(await this.webhooks.list(client.id))]

    for (const webhook of sync.webhooks || []) {
      const webhookIndex = oldWebhooks.findIndex((x) => x.url === webhook.url)
      if (webhookIndex >= 0) {
        oldWebhooks.splice(webhookIndex, 1)
      } else {
        await this.webhooks.create(client.id, webhook.url)
      }
    }

    for (const unusedWebhook of oldWebhooks) {
      await this.webhooks.delete(unusedWebhook.id)
    }

    return { clientId: client.id, clientToken: token, providerName: provider.name }
  }
}
