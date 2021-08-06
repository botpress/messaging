import _ from 'lodash'
import { v4 as uuidv4 } from 'uuid'
import { Service } from '../base/service'
import { uuid } from '../base/types'
import { ChannelService } from '../channels/service'
import { ClientService } from '../clients/service'
import { Client } from '../clients/types'
import { ConduitService } from '../conduits/service'
import { ConfigService } from '../config/service'
import { DistributedService } from '../distributed/service'
import { LoggerService } from '../logger/service'
import { Logger } from '../logger/types'
import { ProviderService } from '../providers/service'
import { Provider } from '../providers/types'
import { WebhookService } from '../webhooks/service'
import { SyncChannels, SyncRequest, SyncResult, SyncSandboxRequest, SyncWebhook } from './types'

export class SyncService extends Service {
  private logger: Logger

  constructor(
    private loggers: LoggerService,
    private config: ConfigService,
    private distributed: DistributedService,
    private channels: ChannelService,
    private providers: ProviderService,
    private conduits: ConduitService,
    private clients: ClientService,
    private webhooks: WebhookService
  ) {
    super()
    this.logger = this.loggers.root.sub('sync')
  }

  async setup() {
    let config = this.config.current.sync

    if (process.env.SYNC) {
      try {
        config = JSON.parse(process.env.SYNC) || {}
      } catch {
        this.logger.warn('SYNC is not valid json')
      }
    }

    for (const req of config || []) {
      req.sandbox ? await this.syncSandbox(req) : await this.sync(req, { name: true, id: true, token: true })
    }
  }

  async sync(req: SyncRequest, force: { name?: boolean; id?: boolean; token?: boolean }): Promise<SyncResult> {
    let result: SyncResult

    const lockedTask = async () => {
      const client = await this.syncClient(
        req.id,
        force.name ? req.name : undefined,
        force.id ? req.id : undefined,
        force.token ? req.token : undefined
      )

      await this.syncConduits(client.providerId, req.channels || {})
      const webhooks = await this.syncWebhooks(client.id, req.webhooks || [])

      result = { id: client.id, token: client.token || req.token!, webhooks }
    }

    if (req.id) {
      await this.distributed.using(`lock_dyn_sync_client::${req.id}`, lockedTask)
    } else {
      await lockedTask()
    }

    return result!
  }

  async syncSandbox(req: SyncSandboxRequest) {
    const provider = await this.syncProvider(req.name, true)
    await this.syncConduits(provider.id, req.channels || {})
  }

  private async syncProvider(name: string, sandbox: boolean): Promise<Provider> {
    let provider = await this.providers.getByName(name)

    if (!provider) {
      provider = await this.providers.create(name, sandbox)
    }

    if (provider.sandbox !== sandbox) {
      await this.providers.updateSandbox(provider.id, sandbox)
    }

    return provider
  }

  private async syncConduits(providerId: uuid, conduits: SyncChannels) {
    const oldConduits = [...(await this.conduits.listByProvider(providerId))]

    for (const [channel, config] of Object.entries(conduits)) {
      // A conduit is enabled by default (don't need to set enabled: true)
      if (config.enabled !== undefined && !config.enabled) {
        continue
      }
      const configWithoutEnabled = _.omit(config, ['enabled'])

      const channelId = this.channels.getByName(channel).id
      const oldConduitIndex = oldConduits.findIndex((x) => x.channelId === channelId)

      if (oldConduitIndex < 0) {
        await this.conduits.create(providerId, channelId, configWithoutEnabled)
      } else {
        const oldConduit = (await this.conduits.getByProviderAndChannel(providerId, channelId))!

        if (!_.isEqual(configWithoutEnabled, oldConduit.config)) {
          await this.conduits.updateConfig(oldConduit.id, configWithoutEnabled)
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
    forceProviderName?: string,
    forceClientId?: uuid,
    forceToken?: string
  ): Promise<Client & { token?: string }> {
    let client: Client | undefined = undefined
    let token: string | undefined = undefined
    let provider: Provider | undefined = undefined

    if (clientId) {
      client = await this.clients.getById(clientId)
    }

    // For when messaging is spinned. Assures that a certain botId always gets back the same clientId when calling messaging
    if (!client && forceProviderName && !forceClientId) {
      const exisingProvider = await this.providers.getByName(forceProviderName)
      if (exisingProvider) {
        const existingClient = await this.clients.getByProviderId(exisingProvider.id)
        if (existingClient) {
          token = forceToken || (await this.clients.generateToken())
          await this.clients.updateToken(existingClient.id, token)
          client = await this.clients.getById(existingClient.id)
        }
      }
    }

    if (!client) {
      const clientId = forceClientId || uuidv4()
      provider = await this.providers.create(clientId, false)

      token = forceToken || (await this.clients.generateToken())
      client = await this.clients.create(provider.id, token, clientId)
    } else {
      provider = await this.providers.getById(client.providerId)

      if (!provider) {
        provider = await this.providers.create(client.id, false)

        await this.clients.updateProvider(client.id, provider.id)
        client = (await this.clients.getById(client.id))!
      }
    }

    const targetName = forceProviderName || client.id
    if (provider.name !== targetName) {
      // If this provider's name conflicts with an old provider, we delete the old provider
      // We only do this when setting a name ourselves to the provider (meaning we made a call to sync with sufficient authority)
      if (forceProviderName) {
        const providerWithSameName = await this.providers.getByName(targetName)
        if (providerWithSameName && providerWithSameName.id !== provider.id) {
          await this.providers.delete(providerWithSameName.id)
        }
      }

      await this.providers.updateName(provider.id, targetName)
    }

    return { ...client, token }
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
