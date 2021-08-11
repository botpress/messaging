import crypto from 'crypto'
import express, { Response, Request, NextFunction, Router } from 'express'
import { IncomingMessage } from 'http'
import yn from 'yn'
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

  // For legacy
  private pageIdToProviderName: { [pageId: string]: string } = {}

  public registerPageId(pageId: string, providerName: string) {
    this.pageIdToProviderName[pageId] = providerName
  }

  protected async setupRoot(root: Router) {
    // json parser needs to be here because extractConduit uses the body to get the pageId
    root.use(this.getRoute(), express.json({ verify: this.prepareAuth.bind(this) }))
    await super.setupRoot(root)
  }

  protected async setupRoutes() {
    this.router.get(
      '/',
      this.asyncMiddleware(async (req, res) => {
        await this.handleWebhookVerification(req, res)
      })
    )

    this.router.post(
      '/',
      this.asyncMiddleware(this.auth.bind(this)),
      this.asyncMiddleware(async (req, res) => {
        await this.handleMessageRequest(req, res)
      })
    )

    this.printWebhook()
  }

  protected async extractConduit(req: Request, res: Response, next: NextFunction) {
    if (yn(process.env.SPINNED)) {
      // When spinned from botpress, it's possible to put anything in the url where the botId should be.
      // To keep compatibility we need to use the pageId instead to identify a provider
      if (req.body?.entry?.length) {
        const pageId = req.body.entry[0].id
        req.params.provider = this.pageIdToProviderName[pageId] || req.params.provider
      }
    }

    return super.extractConduit(req, res, next)
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

  private async auth(req: Request, res: Response, next: NextFunction) {
    const conduit = res.locals.conduit as MessengerConduit
    const buffer = res.locals.authBuffer

    const signature = req.headers['x-hub-signature'] as string
    const [, hash] = signature.split('=')
    const expectedHash = crypto.createHmac('sha1', conduit.config.appSecret).update(buffer).digest('hex')
    if (hash !== expectedHash) {
      throw new Error("Couldn't validate the request signature. Make sure your appSecret is properly configured")
    }

    next()
  }

  private prepareAuth(req: IncomingMessage, res: Response, buffer: Buffer, _encoding: string) {
    res.locals.authBuffer = Buffer.from(buffer)
  }
}
