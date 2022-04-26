import crypto from 'crypto'
import express, { Response, Request, NextFunction } from 'express'
import { IncomingMessage } from 'http'
import { ChannelApi, ChannelApiManager, ChannelApiRequest } from '../base/api'
import { MessengerMessage, MessengerPayload } from './messenger'
import { POSTBACK_PREFIX, SAY_PREFIX } from './renderers/carousel'
import { MessengerService } from './service'

export class MessengerApi extends ChannelApi<MessengerService> {
  async setup(router: ChannelApiManager) {
    router.use('/messenger', express.json({ verify: this.prepareAuth.bind(this) }))
    router.get('/messenger', this.handleWebhookVerification.bind(this))

    router.post('/messenger', this.auth.bind(this))
    router.post('/messenger', this.handleMessageRequest.bind(this))
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
    const payload = req.body as MessengerPayload

    for (const { messaging } of payload.entry) {
      for (const message of messaging) {
        await this.receive(req.scope, message)
      }
    }

    res.status(200).send('EVENT_RECEIVED')
  }

  private async receive(scope: string, message: MessengerMessage) {
    if (message.message) {
      if (message.message?.quick_reply?.payload) {
        await this.service.receive(scope, this.extractEndpoint(message), {
          type: 'quick_reply',
          text: message.message.text,
          payload: message.message.quick_reply.payload
        })
      } else {
        await this.service.receive(scope, this.extractEndpoint(message), { type: 'text', text: message.message.text })
      }
    } else if (message.postback) {
      const payload = message.postback.payload

      if (payload.startsWith(SAY_PREFIX)) {
        await this.service.receive(scope, this.extractEndpoint(message), {
          type: 'say_something',
          text: payload.replace(SAY_PREFIX, '')
        })
      } else if (payload.startsWith(POSTBACK_PREFIX)) {
        await this.service.receive(scope, this.extractEndpoint(message), {
          type: 'postback',
          payload: payload.replace(POSTBACK_PREFIX, '')
        })
      }
    }
  }

  private extractEndpoint(message: MessengerMessage) {
    return { identity: '*', sender: message.sender.id, thread: '*' }
  }
}
