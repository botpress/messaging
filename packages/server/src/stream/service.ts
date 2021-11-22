import { uuid } from '@botpress/messaging-base'
import { DistributedService, Logger, Service } from '@botpress/messaging-engine'
import clc from 'cli-color'
import yn from 'yn'
import { ActionSource } from '../base/source'
import { ChannelService } from '../channels/service'
import { ClientService } from '../clients/service'
import { ConduitService } from '../conduits/service'
import { ConversationCreatedEvent, ConversationEvents } from '../conversations/events'
import { ConversationService } from '../conversations/service'
import { ConverseService } from '../converse/service'
import { HealthCreatedEvent, HealthEvents } from '../health/events'
import { HealthService } from '../health/service'
import { MappingService } from '../mapping/service'
import { MessageCreatedEvent, MessageEvents } from '../messages/events'
import { MessageService } from '../messages/service'
import { PostService } from '../post/service'
import { SocketEvents, SocketUserEvent } from '../socket/events'
import { SocketService } from '../socket/service'
import { UserCreatedEvent, UserEvents } from '../users/events'
import { UserService } from '../users/service'
import { WebhookService } from '../webhooks/service'

export class StreamService extends Service {
  private logger = new Logger('Stream')
  private handleCmdCallback!: (message: any) => Promise<void>

  constructor(
    private distributed: DistributedService,
    private posts: PostService,
    private sockets: SocketService,
    private channels: ChannelService,
    private clients: ClientService,
    private webhooks: WebhookService,
    private conduits: ConduitService,
    private health: HealthService,
    private users: UserService,
    private conversations: ConversationService,
    private messages: MessageService,
    private converse: ConverseService,
    private mapping: MappingService
  ) {
    super()
  }

  async setup() {
    this.handleCmdCallback = this.handleCmd.bind(this)

    this.health.events.on(HealthEvents.Registered, this.handleHealthRegisted.bind(this))
    this.users.events.on(UserEvents.Created, this.handleUserCreated.bind(this))
    this.conversations.events.on(ConversationEvents.Created, this.handleConversationCreated.bind(this))
    this.messages.events.on(MessageEvents.Created, this.handleMessageCreate.bind(this))
    this.sockets.events.on(SocketEvents.UserConnected, this.handleUserConnected.bind(this))
    this.sockets.events.on(SocketEvents.UserDisconnected, this.handleUserDisconnected.bind(this))
  }

  private async handleHealthRegisted({ event }: HealthCreatedEvent) {
    const conduit = await this.conduits.get(event.conduitId)
    const client = await this.clients.getByProviderId(conduit!.providerId)
    if (!client) {
      return
    }

    const channel = this.channels.getById(conduit!.channelId)
    await this.stream('health.new', { channel: channel.name, event: { ...this.health.makeReadable(event) } }, client.id)
  }

  private async handleUserCreated({ user }: UserCreatedEvent) {
    await this.stream('user.new', {}, user.clientId, user.id)
  }

  private async handleConversationCreated({ conversation }: ConversationCreatedEvent) {
    await this.stream(
      'conversation.new',
      { conversationId: conversation.id },
      conversation.clientId,
      conversation.userId
    )
  }

  private async handleMessageCreate({ message, source }: MessageCreatedEvent) {
    const conversation = await this.conversations.get(message.conversationId)

    await this.stream(
      'message.new',
      {
        channel: await this.getChannel(conversation!.id),
        conversationId: conversation!.id,
        collect: this.converse.isCollectingForMessage(message.id),
        message
      },
      conversation!.clientId,
      conversation!.userId,
      source
    )
  }

  private async handleUserConnected({ userId }: SocketUserEvent) {
    await this.distributed.listen(`user/${userId}`, this.handleCmdCallback)
  }

  private async handleUserDisconnected({ userId }: SocketUserEvent) {
    await this.distributed.unsubscribe(`user/${userId}`)
  }

  private async handleCmd({ userId, source, data }: any) {
    const sockets = this.sockets.listByUser(userId)

    for (const socket of sockets) {
      if (source !== socket.id) {
        socket.send(data)
      }
    }
  }

  private async stream(type: string, payload: any, clientId: uuid, userId?: uuid, source?: ActionSource) {
    const data = {
      type,
      data: {
        clientId,
        ...(userId ? { userId } : {}),
        ...payload
      }
    }

    if (yn(process.env.LOGGING_ENABLED)) {
      this.logger.debug(`${clc.blackBright(`[${clientId}]`)} ${clc.cyan(type)}`, data)
    }

    if (userId) {
      await this.distributed.publish(`user/${userId}`, { userId, source: source?.socket?.id, data })
    }

    if (source?.client?.id !== clientId) {
      if (yn(process.env.SPINNED)) {
        void this.posts.send(process.env.SPINNED_URL!, data)
      } else {
        const webhooks = await this.webhooks.list(clientId)

        for (const webhook of webhooks) {
          void this.posts.send(webhook.url, data, { 'x-webhook-token': webhook.token })
        }
      }
    }
  }

  private async getChannel(conversationId: uuid) {
    const convmaps = await this.mapping.convmap.listByConversationId(conversationId)
    if (convmaps.length === 1) {
      const tunnel = await this.mapping.tunnels.get(convmaps[0].tunnelId)
      return this.channels.getById(tunnel!.channelId).name
    } else {
      return 'messaging'
    }
  }
}
