import { Router } from 'express'
import { MessageService } from './service'

export class MessageApi {
  // TODO: replace botId by appId
  private botId: string = 'default'

  constructor(private router: Router, private messages: MessageService) {}

  async setup() {
    this.router.post('/messages', async (req, res) => {
      const { conversationId, payload, authorId } = req.body

      const message = await this.messages.forBot(this.botId).create(conversationId, payload, authorId)

      res.send(message)
    })

    this.router.delete('/messages', async (req, res) => {
      const { id, conversationId } = req.query

      const deleted = await this.messages
        .forBot(this.botId)
        .delete({ id: id as string, conversationId: conversationId as string })

      res.send({ count: deleted })
    })

    this.router.get('/messages/:messageId', async (req, res) => {
      const { messageId } = req.params

      const message = await this.messages.forBot(this.botId).get(messageId)

      if (message) {
        res.send(message)
      } else {
        res.sendStatus(404)
      }
    })

    this.router.get('/messages/', async (req, res) => {
      const { conversationId, limit } = req.query

      const conversations = await this.messages
        .forBot(this.botId)
        .list({ conversationId: conversationId as string, limit: +limit! })

      res.send(conversations)
    })
  }
}
