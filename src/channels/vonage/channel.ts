import crypto from 'crypto'
import express from 'express'
import jwt from 'jsonwebtoken'
import { Channel } from '../base/channel'
import { VonageInstance } from './instance'

export class VonageChannel extends Channel<VonageInstance> {
  get name() {
    return 'vonage'
  }

  get id() {
    return 'bf045a3c-5627-416d-974d-5cfeb277a23f'
  }

  protected createInstance(providerId: string, clientId: string): VonageInstance {
    return new VonageInstance(
      providerId,
      clientId,
      this.kvs,
      this.conversations,
      this.messages,
      this.mapping,
      this.loggers,
      this.router
    )
  }

  async setupRoutes() {
    this.router.use(express.json())

    this.router.post('/inbound', async (req, res) => {
      const instance = res.locals.instance as VonageInstance

      if (this.validate(instance, <any>req)) {
        await instance.receive(req.body)
      }

      res.sendStatus(200)
    })
    this.router.post('/status', async (req, res) => {
      res.sendStatus(200)
    })

    this.printWebhook('inbound')
    this.printWebhook('status')
  }

  private validate(instance: VonageInstance, req: Request): boolean {
    const body = <any>req.body
    const [scheme, token] = (<any>req.headers).authorization.split(' ')

    if (body.from.type !== 'whatsapp' || body.to.type !== 'whatsapp' || scheme.toLowerCase() !== 'bearer' || !token) {
      return false
    }

    try {
      const decoded = <any>jwt.verify(token, instance.config.signatureSecret!, { algorithms: ['HS256'] })

      return (
        decoded.api_key === instance.config.apiKey &&
        crypto.createHash('sha256').update(JSON.stringify(body)).digest('hex') === decoded.payload_hash
      )
    } catch (err) {
      return false
    }
  }
}
