import { Router } from 'express'
import { App } from './app'

export class Api {
  constructor(private app: App, private router: Router) {}

  setup() {
    this.router.post('/:channel/send', async (req, res) => {
      const { channel } = req.params
      const { conversationId, payload } = req.body
      await this.app.channels.get(channel)?.send(conversationId, payload)
    })
  }
}
