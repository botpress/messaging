import express, { Router } from 'express'
import { App } from './app'

export class Api {
  private router: Router

  constructor(private app: App, router: Router) {
    this.router = Router()
    this.router.use(express.json())
    this.router.use(express.urlencoded({ extended: true }))

    router.use('/', this.router)
  }

  async setup() {
    this.router.post('/send', async (req, res) => {
      const { channel, conversationId, payload } = req.body
      await this.app.channels.get(channel)?.send(conversationId, payload)
      res.sendStatus(204)
    })
  }
}
