import crypto from 'crypto'
import express from 'express'
import jwt from 'jsonwebtoken'
import { Channel } from '../base/channel'
import { VonageConduit } from './conduit'

export class VonageChannel extends Channel<VonageConduit> {
  get name() {
    return 'vonage'
  }

  get id() {
    return 'bf045a3c-5627-416d-974d-5cfeb277a23f'
  }

  createConduit() {
    return new VonageConduit()
  }

  async setupRoutes() {
    this.router.use(express.json())

    this.router.use('/inbound', async (req, res) => {
      const conduit = res.locals.conduit as VonageConduit

      if (this.validate(conduit, <any>req)) {
        await conduit.receive(req.body)
      }

      res.sendStatus(200)
    })
    this.router.use('/status', async (req, res) => {
      res.sendStatus(200)
    })

    this.printWebhook('inbound')
    this.printWebhook('status')
  }

  private validate(conduit: VonageConduit, req: Request): boolean {
    const body = <any>req.body
    const [scheme, token] = (<any>req.headers).authorization.split(' ')

    if (body.from.type !== 'whatsapp' || body.to.type !== 'whatsapp' || scheme.toLowerCase() !== 'bearer' || !token) {
      return false
    }

    try {
      const decoded = <any>jwt.verify(token, conduit.config.signatureSecret!, { algorithms: ['HS256'] })

      return (
        decoded.api_key === conduit.config.apiKey &&
        crypto.createHash('sha256').update(JSON.stringify(body)).digest('hex') === decoded.payload_hash
      )
    } catch (err) {
      return false
    }
  }
}
