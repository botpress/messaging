import { uuid } from '@botpress/messaging-base'
import { Response } from 'express'
import { ApiManager } from '../base/api-manager'
import { ClientApiRequest } from '../base/auth/client'
import { UserService } from '../users/service'
import { Schema } from './schema'
import { ConversationService } from './service'

const DEFAULT_LIMIT = 20

export class ConversationApi {
  constructor(private users: UserService, private conversations: ConversationService) {}

  setup(router: ApiManager) {
    router.post('/conversations', Schema.Api.Create, this.create.bind(this))
    router.get('/conversations/:id', Schema.Api.Get, this.get.bind(this))
    router.get('/conversations/user/:userId', Schema.Api.List, this.list.bind(this))
  }

  async create(req: ClientApiRequest, res: Response) {
    const userId = req.body.userId as uuid

    const user = await this.users.fetch(userId)
    if (!user || user.clientId !== req.clientId) {
      return res.sendStatus(404)
    }

    const conversation = await this.conversations.create(req.clientId, userId)
    res.status(201).send(conversation)
  }

  async get(req: ClientApiRequest, res: Response) {
    const id = req.params.id as uuid

    const conversation = await this.conversations.fetch(id)
    if (!conversation || conversation.clientId !== req.clientId) {
      return res.sendStatus(404)
    }

    res.send(conversation)
  }

  async list(req: ClientApiRequest, res: Response) {
    const userId = req.params.userId as uuid
    const limit = +(req.query.limit || DEFAULT_LIMIT)

    const user = await this.users.fetch(userId)
    if (!user || user.clientId !== req.clientId) {
      return res.sendStatus(404)
    }

    const conversations = await this.conversations.listByUserId(req.clientId, userId, limit)
    res.send(conversations)
  }
}
