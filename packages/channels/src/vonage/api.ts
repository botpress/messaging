import { ChannelMessage, ChannelToFrom, MessageSendResponse } from '@vonage/server-sdk'
import crypto from 'crypto'
import express, { Response } from 'express'
import jwt from 'jsonwebtoken'
import { ChannelApi, ChannelApiManager, ChannelApiRequest } from '../base/api'
import { ContentType } from '../content/types'
import { VonageConfig } from './config'
import { VonageService } from './service'

export class VonageApi extends ChannelApi<VonageService> {
  async setup(router: ChannelApiManager) {
    router.use('/vonage', express.json())

    router.post('/vonage/inbound', this.handleInboundRequest.bind(this))
    router.post('/vonage/status', this.handleStatusRequest.bind(this))

    this.service.on('start', this.handleStart.bind(this))
  }

  private async handleStart({ scope }: { scope: string }) {
    await this.printWebhook(scope, 'vonage', 'inbound')
    await this.printWebhook(scope, 'vonage', 'status')
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

    let content: ContentType = { type: 'text', text: undefined! }
    // TODO: Improve Vonage SDK typings
    switch (messageContent.type as any) {
      case 'text':
        const index = Number(messageContent.text)
        // TODO: handleIndexResponse
        content = { type: 'text', text: messageContent.text }
        break
      case 'audio':
        // We have to take for granted that all messages of type audio are voice messages
        // since Vonage does not differentiate the two.
        content = {
          type: 'voice',
          audio: messageContent.audio!.url
        }
        break
      case 'button':
        content = { type: 'text', text: (<any>messageContent).button.text }
        break
      case 'image':
        content = {
          type: 'image',
          image: messageContent.image!.url,
          title: messageContent.image!.caption
        }
        break
      case 'video':
        content = {
          type: 'video',
          video: messageContent.video!.url,
          title: (<any>messageContent).video!.caption
        }
        break
      case 'file':
        content = {
          type: 'file',
          title: messageContent.file!.caption,
          file: messageContent.file!.url
        }
        break
      case 'location':
        content = {
          type: 'location',
          latitude: (<any>messageContent).location!.lat,
          longitude: (<any>messageContent).location!.long
        }
        break
      default:
        break
    }

    await this.service.receive(scope, { identity, sender, thread: '*' }, content)
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
