import crypto from 'crypto'
import express, { Request } from 'express'
import jwt from 'jsonwebtoken'
import { Channel } from '../base/channel'
import { VonageConduit } from './conduit'
import { VonageConfigSchema } from './config'

export class VonageChannel extends Channel<VonageConduit> {
  get name() {
    return 'vonage'
  }

  get id() {
    return 'bf045a3c-5627-416d-974d-5cfeb277a23f'
  }

  get schema() {
    return VonageConfigSchema
  }

  createConduit() {
    return new VonageConduit()
  }

  async setupRoutes() {
    this.router.use(express.json())

    this.router.post(
      '/inbound',
      this.asyncMiddleware(async (req, res) => {
        const conduit = res.locals.conduit as VonageConduit

        if (this.validate(conduit, req)) {
          await conduit.receive(req.body)
        }

        res.sendStatus(200)
      })
    )
    this.router.post(
      '/status',
      this.asyncMiddleware(async (req, res) => {
        res.sendStatus(200)
      })
    )

    this.printWebhook('inbound')
    this.printWebhook('status')
  }

  private validate(conduit: VonageConduit, req: Request): boolean {
    const body = req.body
    const [scheme, token] = (req.headers.authorization || '').split(' ')

    if (body.from.type !== 'whatsapp' || body.to.type !== 'whatsapp' || scheme.toLowerCase() !== 'bearer' || !token) {
      return false
    }

    try {
      const decoded = jwt.verify(token, conduit.config.signatureSecret, { algorithms: ['HS256'] }) as {
        api_key: string
        payload_hash: string
      }

      return (
        decoded.api_key === conduit.config.apiKey &&
        crypto.createHash('sha256').update(JSON.stringify(body)).digest('hex') === decoded.payload_hash
      )
    } catch (err) {
      return false
    }
  }
}
