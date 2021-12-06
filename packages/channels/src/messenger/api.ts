import crypto from 'crypto'
import express, { Response, Request, NextFunction } from 'express'
import { IncomingMessage } from 'http'
import { ChannelApi, ChannelApiManager, ChannelApiRequest } from '../base/api'
import { MessengerService } from './service'

export class MessengerApi extends ChannelApi<MessengerService> {
  async setup(router: ChannelApiManager) {
    router.use('/messenger', express.json({ verify: this.prepareAuth.bind(this) }))
    router.postRaw('/messenger', this.auth.bind(this))

    router.get('/messenger', this.handleWebhookVerification.bind(this))
    router.post('/messenger', this.handleMessageRequest.bind(this))
  }

  private async handleWebhookVerification(req: ChannelApiRequest, res: Response) {
    const { config } = this.service.get(req.scope)

    const mode = req.query['hub.mode']
    const token = req.query['hub.verify_token']
    const challenge = req.query['hub.challenge']

    if (mode && token && mode === 'subscribe' && token === config.verifyToken) {
      console.debug('Webhook Verified')
      res.send(challenge)
    } else {
      res.sendStatus(403)
    }
  }

  private async handleMessageRequest(req: ChannelApiRequest, res: Response) {
    const { client } = this.service.get(req.scope)
    const body = req.body

    for (const entry of body.entry) {
      const messages = entry.messaging

      for (const webhookEvent of messages) {
        if (!webhookEvent.sender) {
          continue
        }

        await client.sendAction(webhookEvent.sender.id, 'mark_seen')
        await this.receive(req.scope, webhookEvent)
      }
    }

    res.send('EVENT_RECEIVED')
  }

  private async receive(scope: string, payload: any) {
    const postback = payload.postback?.payload
    let content

    if (payload.message?.quick_reply) {
      content = {
        type: 'quick_reply',
        text: payload.message.text,
        payload: payload.message.quick_reply.payload
      }
    } else if (payload.message) {
      content = { type: 'text', text: payload.message.text }
    } else if (postback?.startsWith('postback::')) {
      content = { type: 'postback', payload: postback.replace('postback::', '') }
    } else if (postback?.startsWith('say::')) {
      content = { type: 'say_something', text: postback.replace('say::', '') }
    } else {
      content = { type: 'text', text: postback }
    }

    await this.service.receive(
      scope,
      { identity: payload.recipient.id, sender: payload.sender.id, thread: '*' },
      content
    )
  }

  private async auth(req: Request, res: Response, next: NextFunction) {
    const { config } = this.service.get(req.params.scope)
    const buffer = res.locals.authBuffer

    const signature = req.headers['x-hub-signature'] as string
    const [, hash] = signature.split('=')
    const expectedHash = crypto.createHmac('sha1', config.appSecret).update(buffer).digest('hex')
    if (hash !== expectedHash) {
      throw new Error("Couldn't validate the request signature. Make sure your appSecret is properly configured")
    }

    next()
  }

  private prepareAuth(req: IncomingMessage, res: Response, buffer: Buffer, _encoding: string) {
    res.locals.authBuffer = Buffer.from(buffer)
  }
}
