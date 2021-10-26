import { Response } from 'express'
import { ApiManager } from '../base/api-manager'
import { ClientApiRequest } from '../base/auth/client'
import { Schema } from './schema'
import { ConversationService } from './service'

export class ConversationApi {
  constructor(private conversations: ConversationService) {}

  setup(router: ApiManager) {
    router.post('/conversations', Schema.Api.Create, this.create.bind(this))
    router.get('/conversations/:id', Schema.Api.Get, this.get.bind(this))
    router.get('/conversations/user/:id', Schema.Api.List, this.list.bind(this))
    router.get('/conversations/user/:id/recent', Schema.Api.Recent, this.recent.bind(this))
  }

  async create(req: ClientApiRequest, res: Response) {
    const { userId } = req.body

    const conversation = await this.conversations.create(req.client!.id, userId)
    res.send(conversation)
  }

  async get(req: ClientApiRequest, res: Response) {
    const { id } = req.params
    const conversation = await this.conversations.get(id)

    if (conversation && conversation.clientId !== req.client!.id) {
      return res.sendStatus(403)
    } else if (!conversation) {
      return res.sendStatus(404)
    }

    res.send(conversation)
  }

  async list(req: ClientApiRequest, res: Response) {
    const { id } = req.params
    const { limit } = req.query

    const conversations = await this.conversations.listByUserId(req.client!.id, id as string, <any>limit || 20)
    res.send(conversations)
  }

  async recent(req: ClientApiRequest, res: Response) {
    const { id } = req.params

    let conversation = await this.conversations.getMostRecent(req.client!.id, id)
    if (!conversation) {
      conversation = await this.conversations.create(req.client!.id, id)
    }

    res.send(conversation)
  }
}
