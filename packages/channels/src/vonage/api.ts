import { ChannelMessage, ChannelToFrom, MessageSendResponse } from '@vonage/server-sdk'
import crypto from 'crypto'
import express, { Response } from 'express'
import jwt from 'jsonwebtoken'
import { ChannelApi, ChannelApiManager, ChannelApiRequest } from '../base/api'
import { VonageConfig } from './config'
import { VonageService } from './service'

export class VonageApi extends ChannelApi<VonageService> {
  async setup(router: ChannelApiManager) {
    router.use('/vonage', express.json())

    router.post('/vonage/inbound', this.handleInboundRequest.bind(this))
    router.post('/vonage/status', this.handleStatusRequest.bind(this))
  }

  private async handleInboundRequest(req: ChannelApiRequest, res: Response) {
    const { config } = this.service.get(req.scope)

    if (this.validate(req, config)) {
      await this.receive(req.scope, req.body)
    }

    res.sendStatus(200)
  }

  private async handleStatusRequest(req: ChannelApiRequest, res: Response) {
    res.sendStatus(200)
  }

  private async receive(scope: string, payload: VonageRequestBody) {
    const identity = payload.to.number
    const sender = payload.from.number

    const messageContent = payload.message.content

    await this.service.receive(scope, { identity, sender, thread: '*' }, { type: 'text', text: messageContent.text })
  }

  private validate(req: ChannelApiRequest, config: VonageConfig): boolean {
    const body = req.body
    const [scheme, token] = (req.headers.authorization || '').split(' ')

    if (body.from.type !== 'whatsapp' || body.to.type !== 'whatsapp' || scheme.toLowerCase() !== 'bearer' || !token) {
      return false
    }

    try {
      const decoded = jwt.verify(token, config.signatureSecret, { algorithms: ['HS256'] }) as {
        api_key: string
        payload_hash: string
      }

      return (
        decoded.api_key === config.apiKey &&
        crypto.createHash('sha256').update(JSON.stringify(body)).digest('hex') === decoded.payload_hash
      )
    } catch (e) {
      return false
    }
  }
}

export interface VonageRequestBody extends MessageSendResponse {
  to: ChannelToFrom
  from: ChannelToFrom
  message: ChannelMessage
  timestamp: string
}
