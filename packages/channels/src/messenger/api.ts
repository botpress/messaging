import crypto from 'crypto'
import express, { Response, Request, NextFunction } from 'express'
import { IncomingMessage } from 'http'
import { ChannelApi, ChannelApiManager, ChannelApiRequest } from '../base/api'
import { MessengerMessage, MessengerPayload } from './messenger'
import { MessengerService } from './service'

export class MessengerApi extends ChannelApi<MessengerService> {
  async setup(router: ChannelApiManager) {
    router.use('/messenger', express.json({ verify: this.prepareAuth.bind(this) }))
    router.get('/messenger', this.handleWebhookVerification.bind(this))

    router.post('/messenger', this.auth.bind(this))
    router.post('/messenger', this.handleMessageRequest.bind(this))
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
    await this.service.receive(
      scope,
      { identity: '*', sender: message.sender.id, thread: '*' },
      { type: 'text', text: message.message.text }
    )
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

  private prepareAuth(_req: IncomingMessage, res: Response, buffer: Buffer, _encoding: string) {
    res.locals.authBuffer = Buffer.from(buffer)
  }
}
