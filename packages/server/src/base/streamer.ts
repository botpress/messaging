import { uuid } from '@botpress/messaging-base'
import { Dispatcher, DispatchService, Logger } from '@botpress/messaging-engine'
import axios, { AxiosError, AxiosRequestConfig } from 'axios'
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

    const webhooks = await this.webhooks.list(clientId)

    for (const webhook of webhooks) {
      void this.send(process.env.SPINNED_URL || webhook.url, payload, {
        'x-bp-messaging-client-id': clientId,
        'x-bp-messaging-webhook-token': webhook.token
      })
    }
  }

  public async send(url: string, data?: any, headers?: { [name: string]: string }) {
    const config: AxiosRequestConfig<typeof data> = {}

    if (headers) {
      config.headers = headers
    }

    if (process.env.INTERNAL_PASSWORD) {
      if (!config.headers) {
        config.headers = {}
      }

      config.headers.password = process.env.INTERNAL_PASSWORD
    }

    try {
      await backOff(async () => axios.post(url, data, config), {
        jitter: 'none',
        numOfAttempts: MAX_ATTEMPTS,
        retry: (e: AxiosError, attemptNumber: number) => {
          if (attemptNumber === 1 && (e.response?.status !== 503 || !yn(process.env.SPINNED))) {
            this.logWebhookError(e, url, 'Failed to send webhook event on first attempt. Retrying 9 more times')
          }
          return !this.destroyed
        }
      })
    } catch (e) {
      this.logWebhookError(e as AxiosError, url, `Unable to send webhook event after ${MAX_ATTEMPTS} attempts`)
    }
  }

  private logWebhookError(e: AxiosError, url: string, message: string) {
    this.logger.warn(message, {
      url,
      message: e.message,
      response: e.response?.data,
      status: e.response?.status
    })
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
