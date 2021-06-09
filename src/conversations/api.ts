import { Router } from 'express'
import { ApiRequest } from '../api'
import { ClientService } from '../clients/service'
import { ConversationService } from './service'

export class ConversationApi {
  constructor(private router: Router, private clients: ClientService, private conversations: ConversationService) {}

  async setup() {
    this.router.post('/conversations', async (req: ApiRequest, res) => {
      const { userId } = req.body

      const conversation = await this.conversations.create(req.client!.id, userId)

      res.send(conversation)
    })

    this.router.get('/conversations/:id', async (req: ApiRequest, res) => {
      const { id } = req.params

      // TODO: validate client
      const conversation = await this.conversations.get(id)

      res.send(conversation)
    })

    this.router.get('/conversations/', async (req: ApiRequest, res) => {
      const { userId, limit } = req.query

      // TODO: validate client
      const conversations = await this.conversations.listByUserId(req.client!.id, userId as string, +(limit as string))

      res.send(conversations)
    })

    this.router.get('/conversations/:userId/recent', async (req: ApiRequest, res) => {
      const { userId } = req.params

      const conversation = await this.conversations.getMostRecent(req.client!.id, userId)

      res.send(conversation)
    })
  }
}
