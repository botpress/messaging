import { Message, uuid } from '@botpress/messaging-base'
import _ from 'lodash'
import yn from 'yn'
import { Service } from '../base/service'
import { ClientService } from '../clients/service'
import { ConduitService } from '../conduits/service'
import { ConfigService } from '../config/service'
import { ConversationService } from '../conversations/service'
import { InstanceService } from '../instances/service'
import { LoggerService } from '../logger/service'
import { Logger } from '../logger/types'
import { MappingService } from '../mapping/service'
import { MessageService } from '../messages/service'
import { PostService } from '../post/service'
import { SocketService } from '../socket/service'
import { WebhookBroadcaster } from '../webhooks/broadcaster'
import { WebhookService } from '../webhooks/service'
import { WebhookContent } from '../webhooks/types'

export class ChatService extends Service {
  private webhookBroadcaster: WebhookBroadcaster
  private loggingEnabled!: boolean
  private logger!: Logger

  constructor(
    private loggers: LoggerService,
    private configs: ConfigService,
    private posts: PostService,
    private webhooks: WebhookService,
    private conversations: ConversationService,
    private messages: MessageService,
    private sockets: SocketService,
    private mappings: MappingService,
    private clients: ClientService,
    private conduits: ConduitService,
    private instances: InstanceService
  ) {
    super()
    this.webhookBroadcaster = new WebhookBroadcaster(this.posts, this.webhooks)
    this.logger = this.loggers.root.sub('chat')
  }

  async setup() {
    if (process.env.LOGGING_ENABLED?.length) {
      this.loggingEnabled = !!yn(process.env.LOGGING_ENABLED)
    } else if (this.configs.current.logging?.enabled !== null && this.configs.current.logging?.enabled !== undefined) {
      this.loggingEnabled = !!yn(this.configs.current.logging.enabled)
    } else {
      this.loggingEnabled = process.env.NODE_ENV !== 'production'
    }
  }

  async send(conversationId: uuid, authorId: uuid | undefined, payload: any, from: any): Promise<Message> {
    const conversation = await this.conversations.get(conversationId)
    const client = await this.clients.getById(conversation!.clientId)
    const message = await this.messages.create(conversationId, authorId, payload)

    const sockets = this.sockets.listByUser(conversation!.userId)
    for (const socket of sockets) {
      if (from.socket?.id !== socket.id) {
        socket.send({ type: 'message', data: message })
      }
    }

    const convmaps = await this.mappings.convmap.listByConversationId(conversationId)
    for (const convmap of convmaps) {
      const tunnel = await this.mappings.tunnels.get(convmap.tunnelId)
      // TODO: we don't need to get the config here. Just getting the conduitId would be way better
      const conduit = await this.conduits.getByProviderAndChannel(client!.providerId, tunnel!.channelId)
      const endpoint = await this.mappings.getEndpoint(convmap.threadId)
      if (
        !from.endpoint ||
        from.endpoint.identity !== endpoint.identity ||
        from.endpoint.sender !== endpoint.sender ||
        from.endpoint.thread !== endpoint.thread
      ) {
        const instance = await this.instances.get(conduit!.id)
        await instance.sendToEndpoint(endpoint, payload)
      }
    }

    if (from.clientId !== client!.id) {
      await this.sendToWebhooks({
        clientId: client?.id,
        userId: conversation?.userId,
        conversationId,
        message,
        channel: 'messaging'
      })
    }

    return message
  }

  async sendToWebhooks({ clientId, userId, conversationId, message, channel }: any) {
    const post: WebhookContent = {
      type: 'message',
      client: { id: clientId },
      channel: { name: channel },
      user: { id: userId },
      conversation: { id: conversationId },
      message
    }

    if (this.loggingEnabled) {
      this.logger.debug('Received message', post)
    }

    void this.webhookBroadcaster.send(clientId, post)
  }
}
