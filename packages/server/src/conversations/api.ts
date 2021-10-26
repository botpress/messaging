import { uuid } from '@botpress/messaging-base'
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
    router.get('/conversations/user/:userId', Schema.Api.List, this.list.bind(this))
    router.get('/conversations/user/:userId/recent', Schema.Api.Recent, this.recent.bind(this))
  }

  async create(req: ClientApiRequest, res: Response) {
    const userId = req.body.userId as uuid

    const conversation = await this.conversations.create(req.client!.id, userId)
    res.send(conversation)
  }

  async get(req: ClientApiRequest, res: Response) {
    const id = req.params.id as uuid

    const conversation = await this.conversations.get(id)
    if (!conversation || conversation.clientId !== req.client!.id) {
      return res.send(undefined)
    }

    res.send(conversation)
  }

  async list(req: ClientApiRequest, res: Response) {
    const userId = req.params.userId as uuid
    const limit = +(req.query.limit || 20)

    const conversations = await this.conversations.listByUserId(req.client!.id, userId, limit)
    res.send(conversations)
  }

  async recent(req: ClientApiRequest, res: Response) {
    const userId = req.params.userId as uuid

    let conversation = await this.conversations.getMostRecent(req.client!.id, userId)
    if (!conversation) {
      conversation = await this.conversations.create(req.client!.id, userId)
    }

    res.send(conversation)
  }
}
