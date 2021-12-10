import { uuid } from '@botpress/messaging-base'
import { DispatchService, Logger, Service } from '@botpress/messaging-engine'
import clc from 'cli-color'
import yn from 'yn'
import { ActionSource } from '../base/source'
import { PostService } from '../post/service'
import { SocketEvents, SocketUserEvent } from '../socket/events'
import { SocketService } from '../socket/service'
import { WebhookService } from '../webhooks/service'
import { StreamDispatcher, StreamDispatches, StreamMessageDispatch } from './dispatch'

export class StreamService extends Service {
  private logger = new Logger('Stream')
  private dispatcher!: StreamDispatcher

  constructor(
    private dispatches: DispatchService,
    private posts: PostService,
    private sockets: SocketService,
    private webhooks: WebhookService
  ) {
    super()
  }

  async setup() {
    this.sockets.events.on(SocketEvents.UserConnected, this.handleUserConnected.bind(this))
    this.sockets.events.on(SocketEvents.UserDisconnected, this.handleUserDisconnected.bind(this))

    this.dispatcher = await this.dispatches.create('dispatch_socket', StreamDispatcher)
    this.dispatcher.on(StreamDispatches.Message, this.handleDispatchMessage.bind(this))
  }

  private async handleUserConnected({ userId }: SocketUserEvent) {
    await this.dispatcher.subscribe(userId)
  }

  private async handleUserDisconnected({ userId }: SocketUserEvent) {
    await this.dispatcher.unsubscribe(userId)
  }

  private async handleDispatchMessage(userId: uuid, { source, payload }: StreamMessageDispatch) {
    const sockets = this.sockets.listByUser(userId)

    for (const socket of sockets) {
      if (source !== socket.id) {
        socket.send(payload)
      }
    }
  }

  async stream(type: string, data: any, clientId: uuid, userId?: uuid, source?: ActionSource) {
    const payload = {
      type,
      data: {
        clientId,
        ...(userId ? { userId } : {}),
        ...data
      }
    }

    if (yn(process.env.LOGGING_ENABLED)) {
      this.logger.debug(`${clc.blackBright(`[${clientId}]`)} ${clc.cyan(type)}`, payload)
    }

    if (userId) {
      await this.dispatcher.publish(StreamDispatches.Message, userId, { source: source?.socket?.id, payload })
    }

    if (source?.client?.id !== clientId) {
      if (yn(process.env.SPINNED)) {
        void this.posts.send(process.env.SPINNED_URL!, payload)
      } else {
        const webhooks = await this.webhooks.list(clientId)

        for (const webhook of webhooks) {
          void this.posts.send(webhook.url, payload, { 'x-webhook-token': webhook.token })
        }
      }
    }
  }
}
