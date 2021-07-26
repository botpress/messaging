import crypto from 'crypto'
import express, { Response, Request } from 'express'
import { ServerResponse, IncomingMessage } from 'http'
import { Channel } from '../base/channel'
import { MessengerConduit } from './conduit'
import { MessengerConfigSchema } from './config'

export class MessengerChannel extends Channel<MessengerConduit> {
  get name() {
    return 'messenger'
  }

  get id() {
    return 'c4bb1487-b3bd-49b3-a3dd-36db908d165d'
  }

  get schema() {
    return MessengerConfigSchema
  }

  get initiable() {
    return true
  }

  createConduit() {
    return new MessengerConduit()
  }

  async setupRoutes() {
    this.router.use(express.json({ verify: this.auth.bind(this) }))

    this.router.get(
      '/',
      this.asyncMiddleware(async (req, res) => {
        await this.handleWebhookVerification(req, res)
      })
    )

    this.router.post(
      '/',
      this.asyncMiddleware(async (req, res) => {
        await this.handleMessageRequest(req, res)
      })
    )

    this.printWebhook()
  }

  private async handleWebhookVerification(req: Request, res: Response) {
    const conduit = res.locals.conduit as MessengerConduit

    const mode = req.query['hub.mode']
    const token = req.query['hub.verify_token']
    const challenge = req.query['hub.challenge']

    if (mode && token && mode === 'subscribe' && token === conduit.config.verifyToken) {
      this.logger.debug('Webhook Verified')
      res.send(challenge)
    } else {
      res.sendStatus(403)
    }
  }

  private async handleMessageRequest(req: Request, res: Response) {
    const conduit = res.locals.conduit as MessengerConduit
    const body = req.body

    for (const entry of body.entry) {
      const messages = entry.messaging

      for (const webhookEvent of messages) {
        if (!webhookEvent.sender) {
          continue
        }

        await conduit.client.sendAction(webhookEvent.sender.id, 'mark_seen')

        await this.app.instances.receive(conduit.conduitId, webhookEvent)
      }
    }

    res.send('EVENT_RECEIVED')
  }

  private auth(req: IncomingMessage, res: ServerResponse & Response, buffer: Buffer, _encoding: string) {
    const conduit = res.locals.conduit as MessengerConduit

    const signature = req.headers['x-hub-signature'] as string
    const [, hash] = signature.split('=')
    const expectedHash = crypto.createHmac('sha1', conduit.config.appSecret).update(buffer).digest('hex')
    if (hash !== expectedHash) {
      this.logger.error("Couldn't validate the request signature. Make sure your appSecret is properly configured.")

      throw new Error()
    }
  }
}
