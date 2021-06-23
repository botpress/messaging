import _ from 'lodash'
import { Service } from '../base/service'
import { uuid } from '../base/types'
import { ChannelService } from '../channels/service'
import { ClientService } from '../clients/service'
import { Client } from '../clients/types'
import { ConduitService } from '../conduits/service'
import { ConfigService } from '../config/service'
import { ProviderService } from '../providers/service'
import { Provider } from '../providers/types'
import { WebhookService } from '../webhooks/service'
import { SyncConduits, SyncRequest, SyncResult, SyncSandboxRequest, SyncWebhook } from './types'

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
    for (const req of this.config.current.sync || []) {
      req.sandbox ? await this.syncSandbox(req) : await this.sync(req, true)
    }
  }

  async sync(req: SyncRequest, force: boolean): Promise<SyncResult> {
    const provider = await this.syncProvider(req.providerName, false)
    await this.syncConduits(provider.id, req.conduits || {})

    const client = await this.syncClient(
      req.clientId,
      provider.id,
      force ? req.clientId : undefined,
      force ? req.clientToken : undefined
    )
    await this.syncWebhooks(client.id, req.webhooks || [])

    return { providerName: provider.name, clientId: client.id, clientToken: client.token }
  }

  async syncSandbox(req: SyncSandboxRequest) {
    const provider = await this.syncProvider(req.providerName, true)
    await this.syncConduits(provider.id, req.conduits || {})
  }

  private async syncProvider(name: string, sandbox: boolean): Promise<Provider> {
    let provider = await this.providers.getByName(name)

    if (!provider) {
      provider = await this.providers.create(undefined, name, sandbox)
    }

    if (provider.sandbox !== sandbox) {
      await this.providers.updateSandbox(provider.id, sandbox)
    }

    return provider
  }

  private async syncConduits(providerId: uuid, conduits: SyncConduits) {
    const oldConduits = [...(await this.conduits.listByProvider(providerId))]

    for (const [channel, config] of Object.entries(conduits)) {
      const channelId = this.channels.getByName(channel).id
      const oldConduitIndex = oldConduits.findIndex((x) => x.channelId === channelId)

      if (oldConduitIndex < 0) {
        await this.conduits.create(providerId, channelId, config)
      } else {
        const oldConduit = (await this.conduits.getByProviderAndChannel(providerId, channelId))!

        if (!_.isEqual(config, oldConduit.config)) {
          await this.conduits.updateConfig(oldConduit.id, config)
        }

        oldConduits.splice(oldConduitIndex, 1)
      }
    }

    for (const unusedConduit of oldConduits) {
      await this.conduits.delete(unusedConduit.id)
    }
  }

  private async syncClient(
    clientId: uuid | undefined,
    providerId: uuid,
    forceClientId?: uuid,
    forceToken?: string
  ): Promise<Client & { token?: string }> {
    let client: Client | undefined = undefined
    let token: string | undefined = undefined

    if (clientId) {
      client = await this.clients.getById(clientId)
    }

    if (!client) {
      const oldClients = await this.clients.listByProviderId(providerId)
      for (const oldClient of oldClients) {
        await this.clients.updateProvider(oldClient.id, null)
      }

      token = forceToken || (await this.clients.generateToken())
      client = await this.clients.create(providerId, token, forceClientId)
    }

    if (client.providerId !== providerId) {
      await this.clients.updateProvider(client.id, client.providerId)
    }

    return { ...client, token }
  }

  private async syncWebhooks(clientId: uuid, webhooks: SyncWebhook[]) {
    const oldWebhooks = [...(await this.webhooks.list(clientId))]

    for (const webhook of webhooks) {
      const oldWebhookIndex = oldWebhooks.findIndex((x) => x.url === webhook.url)

      if (oldWebhookIndex < 0) {
        await this.webhooks.create(clientId, webhook.url)
      } else {
        oldWebhooks.splice(oldWebhookIndex, 1)
      }
    }

    for (const unusedWebhook of oldWebhooks) {
      await this.webhooks.delete(unusedWebhook.id)
    }
  }
}
