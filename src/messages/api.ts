import { Router } from 'express'
import { ClientService } from '../clients/service'
import { MessageService } from './service'

export class MessageApi {
  constructor(private router: Router, private clients: ClientService, private messages: MessageService) {}

  async setup() {
    this.router.post('/messages', async (req, res) => {
      const { token } = req.headers
      const { conversationId, payload, authorId } = req.body

      const client = (await this.clients.getByToken(token as string))!
      const message = await this.messages.forClient(client.id).create(conversationId, payload, authorId)

      res.send(message)
    })

    this.router.delete('/messages', async (req, res) => {
      const { token } = req.headers
      const { id, conversationId } = req.query

      const client = (await this.clients.getByToken(token as string))!
      const deleted = await this.messages
        .forClient(client.id)
        .delete({ id: id as string, conversationId: conversationId as string })

      res.send({ count: deleted })
    })

    this.router.get('/messages/:messageId', async (req, res) => {
      const { token } = req.headers
      const { messageId } = req.params

      const client = (await this.clients.getByToken(token as string))!
      const message = await this.messages.forClient(client.id).get(messageId)

      if (message) {
        res.send(message)
      } else {
        res.sendStatus(404)
      }
    })

    this.router.get('/messages/', async (req, res) => {
      const { token } = req.headers
      const { conversationId, limit } = req.query

      const client = (await this.clients.getByToken(token as string))!
      const conversations = await this.messages
        .forClient(client.id)
        .list({ conversationId: conversationId as string, limit: +limit! })

      res.send(conversations)
    })
  }
}
