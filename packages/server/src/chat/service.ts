import { Message, uuid } from '@botpress/messaging-base'
import _ from 'lodash'
import { Socket } from 'socket.io'
import yn from 'yn'
import { Service } from '../base/service'
import { ChannelService } from '../channels/service'
import { ClientService } from '../clients/service'
import { ConduitService } from '../conduits/service'
import { ConfigService } from '../config/service'
import { ConversationService } from '../conversations/service'
import { InstanceService } from '../instances/service'
import { LoggerService } from '../logger/service'
import { Logger } from '../logger/types'
import { MappingService } from '../mapping/service'
import { Endpoint } from '../mapping/types'
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
    private channels: ChannelService,
    private clients: ClientService,
    private webhooks: WebhookService,
    private conduits: ConduitService,
    private conversations: ConversationService,
    private messages: MessageService,
    private mappings: MappingService,
    private instances: InstanceService,
    private sockets: SocketService
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

  async send(
    conversationId: uuid,
    authorId: uuid | undefined,
    payload: any,
    from: { socket?: Socket; endpoint?: Endpoint; clientId?: uuid }
  ): Promise<Message> {
    const conversation = await this.conversations.get(conversationId)
    const client = await this.clients.getById(conversation!.clientId)
    const message = await this.messages.create(conversationId, authorId, payload)

    const sockets = this.sockets.listByUser(conversation!.userId)
    for (const socket of sockets) {
      if (from.socket?.id !== socket.id) {
        socket.send({ type: 'message', data: message })
      }
    }

    let channel: string = 'messaging'
    const convmaps = await this.mappings.convmap.listByConversationId(conversationId)

    for (const convmap of convmaps) {
      const endpoint = await this.mappings.getEndpoint(convmap.threadId)

      const tunnel = await this.mappings.tunnels.get(convmap.tunnelId)
      if (convmaps.length === 1) {
        channel = this.channels.getById(tunnel!.channelId).name
      }

      if (
        !from.endpoint ||
        (from.endpoint.identity || '*') !== endpoint.identity ||
        (from.endpoint.sender || '*') !== endpoint.sender ||
        (from.endpoint.thread || '*') !== endpoint.thread
      ) {
        // TODO: we don't need to get the config here. Just getting the conduitId would be way better
        const conduit = await this.conduits.getByProviderAndChannel(client!.providerId, tunnel!.channelId)
        if (!conduit) {
          continue
        }

        const instance = await this.instances.get(conduit!.id)
        await instance.sendToEndpoint(endpoint, payload)
      }
    }

    if (from.clientId !== client!.id) {
      const post: WebhookContent = {
        type: 'message',
        client: { id: client!.id },
        channel: { name: channel },
        user: { id: conversation!.userId },
        conversation: { id: conversationId },
        message
      }

      if (this.loggingEnabled) {
        this.logger.debug('Received message', post)
      }

      void this.webhookBroadcaster.send(client!.id, post)
    }

    return message
  }
}
