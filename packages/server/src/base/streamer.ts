import { uuid } from '@botpress/messaging-base'
import { Dispatcher, DispatchService, Logger } from '@botpress/messaging-engine'
import axios, { AxiosRequestConfig } from 'axios'
import clc from 'cli-color'
import { backOff } from 'exponential-backoff'
import yn from 'yn'
import { ActionSource } from '../base/source'
import { SocketEvents, SocketUserEvent } from '../socket/events'
import { SocketService } from '../socket/service'
import { WebhookService } from '../webhooks/service'

const MAX_ATTEMPTS = 10

export class Streamer {
  private logger = new Logger('Stream')
  private dispatcher!: StreamDispatcher
  private destroyed: boolean = false

  constructor(private dispatches: DispatchService, private sockets: SocketService, private webhooks: WebhookService) {}

  async setup() {
    this.sockets.events.on(SocketEvents.UserConnected, this.handleUserConnected.bind(this))
    this.sockets.events.on(SocketEvents.UserDisconnected, this.handleUserDisconnected.bind(this))

    this.dispatcher = await this.dispatches.create('dispatch_socket', StreamDispatcher)
    this.dispatcher.on(StreamerDispatches.Message, this.handleDispatchMessage.bind(this))
  }

  async destroy() {
    // TODO: we could close off all http connections here

    this.destroyed = true
  }

  private async handleUserConnected({ userId }: SocketUserEvent) {
    await this.dispatcher.subscribe(userId)
  }

  private async handleUserDisconnected({ userId }: SocketUserEvent) {
    await this.dispatcher.unsubscribe(userId)
  }

  private async handleDispatchMessage(userId: uuid, { source, payload }: StreamerMessageDispatch) {
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
      await this.dispatcher.publish(StreamerDispatches.Message, userId, { source: source?.socket?.id, payload })
    }

    if (source?.client?.id !== clientId) {
      if (yn(process.env.SPINNED)) {
        void this.send(process.env.SPINNED_URL!, payload)
      } else {
        const webhooks = await this.webhooks.list(clientId)

        for (const webhook of webhooks) {
          void this.send(webhook.url, payload, { 'x-webhook-token': webhook.token })
        }
      }
    }
  }

  public async send(url: string, data?: any, headers?: { [name: string]: string }) {
    const config: AxiosRequestConfig<typeof data> = { headers: {} }

    if (headers) {
      config.headers = headers
    }

    if (process.env.INTERNAL_PASSWORD) {
      config.headers!.password = process.env.INTERNAL_PASSWORD
    }

    try {
      await backOff(async () => axios.post(url, data, config), {
        jitter: 'none',
        numOfAttempts: MAX_ATTEMPTS,
        retry: (_e: any, _attemptNumber: number) => {
          return !this.destroyed
        }
      })
    } catch (e) {
      this.logger.warn(
        `Unabled to reach webhook after ${MAX_ATTEMPTS} attempts ${clc.blackBright(url)} ${clc.blackBright(
          `Error: ${(e as Error).message}`
        )}`
      )
    }
  }
}

export enum StreamerDispatches {
  Message
}

export interface StreamerMessageDispatch {
  source?: string
  payload: {
    type: string
    data: any
  }
}

export class StreamDispatcher extends Dispatcher<{
  [StreamerDispatches.Message]: StreamerMessageDispatch
}> {}
