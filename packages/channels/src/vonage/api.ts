import crypto from 'crypto'
import express, { NextFunction, Response } from 'express'
import jwt from 'jsonwebtoken'
import { ChannelApi, ChannelApiManager, ChannelApiRequest } from '../base/api'
import { VonageService } from './service'

export class VonageApi extends ChannelApi<VonageService> {
  async setup(router: ChannelApiManager) {
    router.use('/vonage', express.json())

    router.post('/vonage', this.verifyRequestSignature.bind(this))
    router.post('/vonage', this.handleRequest.bind(this))
  }

  private async verifyRequestSignature(req: ChannelApiRequest, res: Response, next: NextFunction) {
    const { config } = this.service.get(req.scope)

    const body = req.body
    const [scheme, token] = (req.headers.authorization || '').split(' ')

    if (body.channel !== 'whatsapp' || scheme.toLowerCase() !== 'bearer' || !token) {
      return res.sendStatus(401)
    }

    try {
      const decoded = jwt.verify(token, config.signatureSecret, { algorithms: ['HS256'] }) as {
        api_key: string
        payload_hash: string
      }

      if (
        decoded.api_key === config.apiKey &&
        crypto.createHash('sha256').update(JSON.stringify(body)).digest('hex') === decoded.payload_hash
      ) {
        next()
      } else {
        return res.sendStatus(403)
      }
    } catch (e) {
      return res.sendStatus(403)
    }
  }

  private async handleRequest(req: ChannelApiRequest, res: Response) {
    if (req.body.status) {
      return res.sendStatus(200)
    }

    await this.service.receive(
      req.scope,
      { identity: req.body.to, sender: req.body.from, thread: '*' },
      { type: 'text', text: req.body.text }
    )

    res.sendStatus(200)
  }
}
