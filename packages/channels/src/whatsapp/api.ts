import crypto from 'crypto'
import express, { Response, Request, NextFunction } from 'express'
import { IncomingMessage } from 'http'
import { ChannelApi, ChannelApiManager, ChannelApiRequest } from '../base/api'
import { WhatsappService } from './service'
import { WhatsappMessage, WhatsappPayload } from './whatsapp'

export class WhatsappApi extends ChannelApi<WhatsappService> {
  async setup(router: ChannelApiManager) {
    router.use('/whatsapp', express.json({ verify: this.prepareAuth.bind(this) }))
    router.get('/whatsapp', this.handleWebhookVerification.bind(this))

    router.post('/whatsapp', this.auth.bind(this))
    router.post('/whatsapp', this.handleMessageRequest.bind(this))
  }

  private prepareAuth(_req: IncomingMessage, res: Response, buffer: Buffer, _encoding: string) {
    res.locals.authBuffer = Buffer.from(buffer)
  }

  private async handleWebhookVerification(req: ChannelApiRequest, res: Response) {
    const { config } = this.service.get(req.scope)

    const mode = req.query['hub.mode']
    const token = req.query['hub.verify_token']
    const challenge = req.query['hub.challenge']

    if (mode === 'subscribe' && token === config.verifyToken) {
      res.status(200).send(challenge)
    } else {
      res.sendStatus(403)
    }
  }

  private async auth(req: Request, res: Response, next: NextFunction) {
    const signature = req.headers['x-hub-signature'] as string
    const [, hash] = signature.split('=')

    const { config } = this.service.get(req.params.scope)
    const expectedHash = crypto.createHmac('sha1', config.appSecret).update(res.locals.authBuffer).digest('hex')

    if (hash !== expectedHash) {
      return res.sendStatus(403)
    } else {
      next()
    }
  }

  private async handleMessageRequest(req: ChannelApiRequest, res: Response) {
    const payload = req.body as WhatsappPayload

    for (const entry of payload.entry) {
      if (entry.changes && entry.changes.length > 0) {
        const change = entry.changes[0]
        if (change.field && change.field === 'messages') {
          const value = change.value
          if (value && 'messages' in value && value.messages && value.messages.length > 0) {
            for (const message of value.messages) {
              await this.receive(req.scope, message)
            }
          }
        }
      }
    }
    res.status(200).send('EVENT_RECEIVED')
  }

  private async receive(scope: string, message: WhatsappMessage) {
    if (message && message.id && message.type && message.from) {
      if (message.type === 'text' && message.text && message.text.body) {
        await this.service.receive(scope, this.extractEndpoint(message), {
          id: message.id,
          type: 'text',
          text: message.text.body
        })
      } else if (message.type === 'interactive' && message.interactive) {
        let payload
        if (message.interactive.type === 'button_reply' && message.interactive.button_reply) {
          payload = message.interactive.button_reply
        } else if (message.interactive.type === 'list_reply' &&message.interactive.list_reply) {
          payload = message.interactive.list_reply
        }
        if (payload?.id.startsWith('reply::')) {
          await this.service.receive(scope, this.extractEndpoint(message), {
            id: message.id,
            type: 'quick_reply',
            text: payload.title,
            payload: payload.id.replace('reply::', '')
          })
        }
      }
    }
  }

  private extractEndpoint(message: WhatsappMessage) {
    return {
      identity: '*',
      sender: message.from,
      thread: '*'
    }
  }
}
