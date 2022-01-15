import { Router, NextFunction, Request, Response } from 'express'
import { uuid } from '.'
import { MessagingChannelApi } from './api'
import { Schemas } from './schema'

export class MessagingChannel extends MessagingChannelApi {
  setup(router: Router, route?: string) {
    router.post(route || '/', this.asyncMiddleware(this.handleRequest.bind(this)))
  }

  private asyncMiddleware(fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) {
    return (req: Request, res: Response, next: NextFunction) => {
      fn(req, res, next).catch(() => {
        return res.sendStatus(500)
      })
    }
  }

  private async handleRequest(req: Request, res: Response) {
    const clientId = this.verifyToken(req)
    if (!clientId) {
      return res.sendStatus(403)
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

      await this.emit('message', clientId, data)
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
    }

    res.sendStatus(200)
  }

  private verifyToken(req: Request) {
    const clientId = req.headers['x-bp-messaging-client-id'] as string
    const webhookToken = req.headers['x-bp-messaging-webhook-token'] as string

    if (!webhookToken || webhookToken !== this.auths[clientId].webhookToken) {
      return undefined
    }

    return clientId
  }
}
