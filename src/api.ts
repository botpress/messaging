import express, { Router } from 'express'
import { App } from './app'
import { MessageApi } from './messages/api'

export class Api {
  messages: MessageApi

  private router!: Router

  constructor(private app: App, private root: Router) {
    this.router = Router()
    this.messages = new MessageApi(this.router, app.clients, app.messages)
  }

  async setup() {
    this.router.use(express.json())
    this.router.use(express.urlencoded({ extended: true }))
    this.root.use('/api', this.router)

    this.router.post('/send', async (req, res) => {
      const { token } = req.headers
      const { channel, conversationId, payload } = req.body

      const client = (await this.app.clients.get(token as string))!
      await this.app.channels.get(client.providerId, channel)?.send(conversationId, payload)

      res.sendStatus(204)
    })

    await this.messages.setup()
  }
}
