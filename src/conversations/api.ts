import { Router } from 'express'
import { ClientService } from '../clients/service'
import { ConversationService } from './service'

export class ConversationApi {
  constructor(private router: Router, private clients: ClientService, private conversations: ConversationService) {}

  async setup() {
    this.router.post('/conversations', async (req, res) => {
      const { token } = req.headers
      const { userId } = req.body

      const client = (await this.clients.getByToken(token as string))!
      const conversation = await this.conversations.create(client.id, userId)

      res.send(conversation)
    })

    this.router.get('/conversations/:id', async (req, res) => {
      const { token } = req.headers
      const { id } = req.params

      const client = (await this.clients.getByToken(token as string))!
      // TODO: validate client
      const conversation = await this.conversations.get(id)

      res.send(conversation)
    })

    this.router.get('/conversations/', async (req, res) => {
      const { token } = req.headers
      const { userId, limit } = req.query

      const client = (await this.clients.getByToken(token as string))!
      // TODO: validate client
      const conversations = await this.conversations.listByUserId(client.id, userId as string, +(limit as string))

      res.send(conversations)
    })

    this.router.get('/conversations/:userId/recent', async (req, res) => {
      const { token } = req.headers
      const { userId } = req.params

      const client = (await this.clients.getByToken(token as string))!
      const conversation = await this.conversations.getMostRecent(client.id, userId)

      res.send(conversation)
    })
  }
}
