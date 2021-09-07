import { uuid } from '@botpress/messaging-base'
import clc from 'cli-color'
import yn from 'yn'
import { Service } from '../base/service'
import { ActionSource } from '../base/source'
import { ChannelService } from '../channels/service'
import { ClientService } from '../clients/service'
import { ConduitService } from '../conduits/service'
import { ConversationEvents } from '../conversations/events'
import { ConversationService } from '../conversations/service'
import { HealthEvents } from '../health/events'
import { HealthService } from '../health/service'
import { Logger } from '../logger/types'
import { MappingService } from '../mapping/service'
import { MessageEvents } from '../messages/events'
import { MessageService } from '../messages/service'
import { PostService } from '../post/service'
import { SocketService } from '../socket/service'
import { UserEvents } from '../users/events'
import { UserService } from '../users/service'
import { WebhookService } from '../webhooks/service'

export class StreamService extends Service {
  private logger = new Logger('Stream')

  constructor(
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
    private mapping: MappingService
  ) {
    super()
  }

  async setup() {
    this.health.events.on(HealthEvents.Registered, async ({ event }) => {
      const conduit = await this.conduits.get(event.conduitId)
      const client = await this.clients.getByProviderId(conduit!.providerId)
      if (!client) {
        return
      }

      const channel = this.channels.getById(conduit!.channelId)
      await this.stream(
        'health.new',
        { channel: channel.name, event: { ...this.health.makeReadable(event) } },
        client.id
      )
    })

    this.users.events.on(UserEvents.Created, async ({ user }) => {
      await this.stream('user.new', {}, user.clientId, user.id)
    })

    this.conversations.events.on(ConversationEvents.Created, async ({ conversation }) => {
      await this.stream(
        'conversation.new',
        { conversationId: conversation.id },
        conversation.clientId,
        conversation.userId
      )
    })

    this.messages.events.on(MessageEvents.Created, async ({ message, source }) => {
      const conversation = await this.conversations.get(message.conversationId)

      await this.stream(
        'message.new',
        { channel: await this.getChannel(conversation!.id), conversationId: conversation!.id, message },
        conversation!.clientId,
        conversation!.userId,
        source
      )
    })
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

  async stream(type: string, payload: any, clientId: uuid, userId?: uuid, source?: ActionSource) {
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
      const sockets = this.sockets.listByUser(userId)
      for (const socket of sockets) {
        if (source?.socket?.id !== socket.id) {
          socket.send({ type, data })
        }
      }
    }

    // TODO: Send socket messages to sockets connected for a clientId

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
}
