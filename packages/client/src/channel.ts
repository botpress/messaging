import { Router, NextFunction, Request, Response } from 'express'
import { uuid } from '.'
import { MessagingChannelApi } from './api'
import { Schemas } from './schema'

/**
 * Multi-tenant version of MessagingClient that allows setting up multiple client ids
 */
export class MessagingChannel extends MessagingChannelApi {
  /**
   * Sets up an express router to receive webhook events
   * @param router an express router
   * @param route optional route to receive events at
   */
  setup(router: Router, route?: string) {
    router.post(route || '/', this.asyncMiddleware(this.handleRequest.bind(this)))
  }

  private asyncMiddleware(fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) {
    return (req: Request, res: Response, next: NextFunction) => {
      fn(req, res, next).catch((e) => {
        this.logger?.error(e, 'Error occured processing webhook event')
        return res.sendStatus(500)
      })
    }
  }

  private async handleRequest(req: Request, res: Response) {
    const clientId = req.headers['x-bp-messaging-client-id'] as string
    const webhookToken = req.headers['x-bp-messaging-webhook-token'] as string
    const auth = this.auths[clientId]

    if (!webhookToken) {
      return res.status(401).send('Unauthorized. Webhook token is missing')
    } else if (!auth) {
      return res.status(404).send('Not Found. Client id is unknown')
    } else if (webhookToken !== auth.webhookToken) {
      return res.status(403).send('Forbidden. Webhook token is incorrect')
    }

    const type = req.body?.type
    const data = req.body?.data
    await this.handleEvent(clientId, type, data, res)
  }

  private async handleEvent(clientId: uuid, type: string, data: any, res: Response) {
    if (type === 'message.new') {
      const { error } = Schemas.MessageNew.validate(data)
      if (error) {
        return res.status(400).send(error.message)
      }

      await this.emit('message', clientId, { ...data, message: this.deserializeMessage(data.message) })
    } else if (type === 'conversation.started') {
      const { error } = Schemas.ConversationStarted.validate(data)
      if (error) {
        return res.status(400).send(error.message)
      }

      await this.emit('started', clientId, data)
    } else if (type === 'user.new') {
      const { error } = Schemas.UserNew.validate(data)
      if (error) {
        return res.status(400).send(error.message)
      }

      await this.emit('user', clientId, data)
    } else if (type === 'message.feedback') {
      const { error } = Schemas.MessageFeedback.validate(data)
      if (error) {
        return res.status(400).send(error.message)
      }

      await this.emit('feedback', clientId, data)
    }

    res.sendStatus(200)
  }
}
