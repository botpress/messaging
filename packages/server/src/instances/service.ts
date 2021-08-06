import axios, { AxiosRequestConfig } from 'axios'
import _ from 'lodash'
import ms from 'ms'
import yn from 'yn'
import { App } from '../app'
import { Service } from '../base/service'
import { uuid } from '../base/types'
import { ServerCache } from '../caching/cache'
import { CachingService } from '../caching/service'
import { ConduitInstance } from '../channels/base/conduit'
import { ChannelService } from '../channels/service'
import { ClientService } from '../clients/service'
import { ConduitService } from '../conduits/service'
import { ConfigService } from '../config/service'
import { ConversationService } from '../conversations/service'
import { DistributedService } from '../distributed/service'
import { LoggerService } from '../logger/service'
import { Logger } from '../logger/types'
import { MappingService } from '../mapping/service'
import { MessageService } from '../messages/service'
import { Message } from '../messages/types'
import { ProviderService } from '../providers/service'
import { WebhookService } from '../webhooks/service'
import { InstanceEmitter, InstanceEvents, InstanceWatcher } from './events'
import { InstanceInvalidator } from './invalidator'
import { InstanceMonitoring } from './monitoring'
import { InstanceSandbox } from './sandbox'

export class InstanceService extends Service {
  get events(): InstanceWatcher {
    return this.emitter
  }

  private emitter: InstanceEmitter
  private invalidator: InstanceInvalidator
  private monitoring: InstanceMonitoring
  private sandbox: InstanceSandbox
  private cache!: ServerCache<uuid, ConduitInstance<any, any>>
  private failures: { [conduitId: string]: number } = {}
  private logger: Logger
  private loggingEnabled!: boolean
  private lazyLoadingEnabled!: boolean

  constructor(
    private loggerService: LoggerService,
    private configService: ConfigService,
    private distributedService: DistributedService,
    private cachingService: CachingService,
    private channelService: ChannelService,
    private providerService: ProviderService,
    private conduitService: ConduitService,
    private clientService: ClientService,
    private webhookService: WebhookService,
    private conversationService: ConversationService,
    private messageService: MessageService,
    private mappingService: MappingService,
    private app: App
  ) {
    super()
    this.emitter = new InstanceEmitter()
    this.invalidator = new InstanceInvalidator(
      this.channelService,
      this.providerService,
      this.conduitService,
      this.clientService,
      this
    )
    this.logger = this.loggerService.root.sub('instances')
    this.monitoring = new InstanceMonitoring(
      this.logger.sub('monitoring'),
      this.distributedService,
      this.channelService,
      this.conduitService,
      this,
      this.failures
    )
    this.sandbox = new InstanceSandbox(this.clientService, this.mappingService, this)
  }

  async setup() {
    if (process.env.LOGGING_ENABLED?.length) {
      this.loggingEnabled = !!yn(process.env.LOGGING_ENABLED)
    } else if (
      this.configService.current.logging?.enabled !== null &&
      this.configService.current.logging?.enabled !== undefined
    ) {
      this.loggingEnabled = !!yn(this.configService.current.logging.enabled)
    } else {
      this.loggingEnabled = process.env.NODE_ENV !== 'production'
    }

    this.lazyLoadingEnabled = !yn(process.env.NO_LAZY_LOADING)

    this.cache = await this.cachingService.newServerCache('cache_instance_by_conduit_id', {
      dispose: this.handleCacheDispose.bind(this),
      max: 50000,
      maxAge: ms('30min')
    })

    await this.invalidator.setup(this.cache, this.failures)
  }

  private async handleCacheDispose(conduitId: uuid, instance: ConduitInstance<any, any>) {
    try {
      await instance.destroy()
      await this.emitter.emit(InstanceEvents.Destroyed, conduitId)
    } catch (e) {
      this.logger.error('Error trying to destroy conduit.', e.message)
    }
  }

  async destroy() {
    if (!this.cache) {
      return
    }

    for (const conduitId of this.cache.keys()) {
      this.cache.del(conduitId)
    }
    this.cache.prune()
  }

  async monitor() {
    await this.monitoring.monitor()
  }

  async initialize(conduitId: uuid) {
    const instance = await this.get(conduitId)

    try {
      await this.distributedService.using(`lock_dyn_instance_init::${conduitId}`, async () => {
        await instance.initialize()
      })
    } catch (e) {
      this.cache.del(conduitId)

      // TODO: replace by StatusService
      instance.logger.error('Error trying to initialize conduit.', (e as Error).message)
      if (!this.failures[conduitId]) {
        this.failures[conduitId] = 0
      }
      this.failures[conduitId]++

      return this.emitter.emit(InstanceEvents.InitializationFailed, conduitId)
    }

    await this.conduitService.updateInitialized(conduitId)
    return this.emitter.emit(InstanceEvents.Initialized, conduitId)
  }

  async get(conduitId: uuid): Promise<ConduitInstance<any, any>> {
    const cached = this.cache.get(conduitId)
    if (cached) {
      return cached
    }

    const conduit = (await this.conduitService.get(conduitId))!
    const channel = this.channelService.getById(conduit.channelId)
    const instance = channel.createConduit()

    try {
      await this.distributedService.using(`lock_dyn_instance_setup::${conduitId}`, async () => {
        await instance.setup(conduitId, conduit.config, this.app)
      })
      this.cache.set(conduitId, instance, channel.lazy && this.lazyLoadingEnabled ? undefined : Infinity)

      await this.emitter.emit(InstanceEvents.Setup, conduitId)
    } catch (e) {
      this.cache.del(conduitId)
      await this.emitter.emit(InstanceEvents.SetupFailed, conduitId)

      // TODO: replace by StatusService
      instance.logger.error('Error trying to setup conduit.', e)
      if (!this.failures[conduitId]) {
        this.failures[conduitId] = 0
      }
      this.failures[conduitId]++
    }

    return instance
  }

  async send(conduitId: uuid, conversationId: uuid, payload: any): Promise<Message> {
    const conduit = (await this.conduitService.get(conduitId))!
    const conversation = (await this.conversationService.get(conversationId))!

    const endpoint = await this.mappingService.getEndpoint(conversation.clientId, conduit.channelId, conversation.id)

    const instance = await this.get(conduitId)
    await instance.sendToEndpoint(endpoint, payload)

    const message = await this.messageService.create(conversationId, conversation!.userId, payload)

    if (this.loggingEnabled) {
      instance.loggerOut.debug('Sending message', {
        clientId: conversation!.clientId,
        message
      })
    }

    return message
  }

  async receive(conduitId: uuid, payload: any) {
    const conduit = (await this.conduitService.get(conduitId))!
    const provider = (await this.providerService.getById(conduit.providerId))!

    const instance = await this.get(conduitId)
    const endpoint = await instance.extractEndpoint(payload)

    if (!endpoint.content.type) {
      return
    }

    const clientId = provider.sandbox
      ? await this.sandbox.getClientId(conduitId, endpoint)
      : (await this.clientService.getByProviderId(provider.id))!.id

    if (!clientId) {
      return
    }

    const { userId, conversationId } = await this.mappingService.getMapping(clientId, conduit.channelId, endpoint)
    const message = await this.messageService.create(conversationId, userId, endpoint.content)

    const post = {
      type: 'message',
      client: { id: clientId },
      channel: { id: conduit.channelId, name: this.channelService.getById(conduit.channelId).name },
      user: { id: userId },
      conversation: { id: conversationId },
      message
    }

    if (this.loggingEnabled) {
      instance.loggerIn.debug('Received message', post)
    }

    if (yn(process.env.SPINNED)) {
      await this.callWebhook(instance, process.env.SPINNED_URL!, post)
    } else {
      const webhooks = await this.webhookService.list(clientId)

      for (const webhook of webhooks) {
        await this.callWebhook(instance, webhook.url, post, webhook.token)
      }
    }
  }

  private async callWebhook(instance: ConduitInstance<any, any>, url: string, data: any, token?: string) {
    const password = process.env.INTERNAL_PASSWORD || this.app.config.current.security?.password
    const config: AxiosRequestConfig = { headers: {} }

    if (password) {
      config.headers.password = password
    }

    if (token) {
      config.headers['x-webhook-token'] = token
    }

    try {
      await axios.post(url, data, config)
    } catch (e) {
      instance.logger.error(`Failed to call webhook ${url}.`, e.message)
    }
  }
}
