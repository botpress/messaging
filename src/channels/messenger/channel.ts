import crypto from 'crypto'
import express from 'express'
import { Channel, EndpointContent } from '../base/channel'
import { ChannelContext } from '../base/context'
import { CardToCarouselRenderer } from '../base/renderers/card'
import { MessengerClient } from './client'
import { MessengerConfig } from './config'
import { MessengerContext } from './context'
import { MessengerRenderers } from './renderers'
import { MessengerSenders } from './senders'

export class MessengerChannel extends Channel<MessengerConfig, MessengerContext> {
  get id(): string {
    return 'messenger'
  }

  private client!: MessengerClient

  protected async setupConnection() {
    this.router.use(express.json({ verify: this.auth.bind(this) }))

    this.router.get('/', async (req, res) => {
      const mode = req.query['hub.mode']
      const token = req.query['hub.verify_token']
      const challenge = req.query['hub.challenge']

      if (mode && token && mode === 'subscribe' && token === this.config.verifyToken) {
        this.logger.debug('Webhook Verified')
        res.send(challenge)
      } else {
        res.sendStatus(403)
      }
    })

    this.router.post('/', async (req, res) => {
      const body = req.body

      for (const entry of body.entry) {
        const messages = entry.messaging

        for (const webhookEvent of messages) {
          if (!webhookEvent.sender) {
            continue
          }
          await this.receive(webhookEvent)
        }
      }

      res.send('EVENT_RECEIVED')
    })

    this.client = new MessengerClient(this.config)

    this.printWebhook()
  }

  protected setupRenderers() {
    return [new CardToCarouselRenderer(), ...MessengerRenderers]
  }

  protected setupSenders() {
    return MessengerSenders
  }

  protected async map(payload: any): Promise<EndpointContent> {
    return {
      content: { type: 'text', text: payload.message.text },
      foreignAppId: payload.recipient.id,
      foreignUserId: payload.sender.id
    }
  }

  protected async context(base: ChannelContext<any>): Promise<MessengerContext> {
    return {
      ...base,
      client: this.client,
      messages: []
    }
  }

  private auth(req: any, res: any, buffer: any) {
    const signature = req.headers['x-hub-signature']
    const [, hash] = signature.split('=')
    const expectedHash = crypto.createHmac('sha1', this.config.appSecret!).update(buffer).digest('hex')
    if (hash !== expectedHash) {
      throw new Error("Couldn't validate the request signature.")
    }
  }
}
