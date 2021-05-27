import express from 'express'
import { validateRequest } from 'twilio'
import { Channel } from '../base/channel'
import { TwilioInstance } from './instance'

export class TwilioChannel extends Channel<TwilioInstance> {
  get name() {
    return 'twilio'
  }

  get id() {
    return '330ca935-6441-4159-8969-d0a0d3f188a1'
  }

  protected createInstance(providerId: string, clientId: string): TwilioInstance {
    return new TwilioInstance(
      providerId,
      clientId,
      this.kvs,
      this.conversations,
      this.messages,
      this.mapping,
      this.loggers,
      this.router
    )
  }

  async setupRoutes() {
    this.router.use(express.urlencoded({ extended: true }))

    this.router.use('/', async (req, res) => {
      const instance = res.locals.instance as TwilioInstance
      const signature = req.headers['x-twilio-signature'] as string
      if (validateRequest(instance.config.authToken!, signature, instance.webhookUrl, req.body)) {
        await instance.receive(req.body)
        res.sendStatus(204)
      } else {
        res.status(401).send('Auth token invalid')
      }
    })

    this.printWebhook()
  }
}
