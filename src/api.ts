import express, { Router } from 'express'
import { App } from './app'
import { MessageApi } from './messages/api'

export class Api {
  messages: MessageApi

  private router!: Router

  constructor(private app: App, private root: Router) {
    this.router = Router()
    this.messages = new MessageApi(this.router, app.messages)
  }

  async setup() {
    this.router.use(express.json())
    this.router.use(express.urlencoded({ extended: true }))
    this.root.use('/api', this.router)

    this.router.post('/send', async (req, res) => {
      const { channel, conversationId, payload } = req.body
      await this.app.channels.get(channel)?.send(conversationId, payload)
      res.sendStatus(204)
    })

    await this.messages.setup()
  }
}
