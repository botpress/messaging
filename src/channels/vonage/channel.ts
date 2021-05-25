import Vonage from '@vonage/server-sdk'
import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import { Channel, EndpointContent } from '../base/channel'
import { ChannelContext } from '../base/context'
import { CardToCarouselRenderer } from '../base/renderers/card'
import { TypingSender } from '../base/senders/typing'
import { VonageConfig } from './config'
import { VonageContext } from './context'
import { VonageRenderers } from './renderers'
import { VonageSenders } from './senders'

export class VonageChannel extends Channel<VonageConfig, VonageContext> {
  get id() {
    return 'vonage'
  }

  get enableParsers() {
    return true
  }

  private vonage!: Vonage

  protected async setupConnection() {
    this.vonage = new Vonage(
      {
        apiKey: this.config.apiKey!,
        apiSecret: this.config.apiSecret!,
        applicationId: this.config.applicationId,
        privateKey: <any>Buffer.from(this.config.privateKey!),
        signatureSecret: this.config.signatureSecret
      },
      {
        apiHost: this.config.useTestingApi ? 'https://messages-sandbox.nexmo.com' : 'https://api.nexmo.com'
      }
    )

    this.router.post('/inbound', async (req, res) => {
      if (this.validate(<any>req)) {
        await this.receive(req.body)
      }

      res.sendStatus(200)
    })
    this.router.post('/status', async (req, res) => {
      res.sendStatus(200)
    })

    this.printWebhook('inbound')
    this.printWebhook('status')
  }

  protected setupRenderers() {
    return [new CardToCarouselRenderer(), ...VonageRenderers]
  }

  protected setupSenders() {
    return [new TypingSender(), ...VonageSenders]
  }

  protected async map(payload: any): Promise<EndpointContent> {
    return {
      content: { type: 'text', text: payload.message.content.text },
      foreignAppId: payload.to.number,
      foreignUserId: payload.from.number
    }
  }

  protected async context(base: ChannelContext<any>): Promise<VonageContext> {
    return {
      ...base,
      client: this.vonage,
      messages: [],
      isSandbox: this.config.useTestingApi!
    }
  }

  private validate(req: Request): boolean {
    const body = <any>req.body
    const [scheme, token] = (<any>req.headers).authorization.split(' ')

    if (body.from.type !== 'whatsapp' || body.to.type !== 'whatsapp' || scheme.toLowerCase() !== 'bearer' || !token) {
      return false
    }

    try {
      const decoded = <any>jwt.verify(token, this.config.signatureSecret!, { algorithms: ['HS256'] })

      return (
        decoded.api_key === this.config.apiKey &&
        crypto.createHash('sha256').update(JSON.stringify(body)).digest('hex') === decoded.payload_hash
      )
    } catch (err) {
      return false
    }
  }
}
