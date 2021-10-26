import { Response, Router } from 'express'
import { Auth } from '../base/auth/auth'
import { ClientApiRequest } from '../base/auth/client'
import { Schema } from './schema'
import { ConversationService } from './service'

export class ConversationApi {
  constructor(private router: Router, private auth: Auth, private conversations: ConversationService) {}

  async setup() {
    this.router.post('/conversations', this.auth.client.auth(this.create.bind(this)))
    this.router.get('/conversations/:id', this.auth.client.auth(this.get.bind(this)))
    this.router.get('/conversations/user/:id', this.auth.client.auth(this.list.bind(this)))
    this.router.get('/conversations/user/:id/recent', this.auth.client.auth(this.recent.bind(this)))
  }

  async create(req: ClientApiRequest, res: Response) {
    const { error } = Schema.Api.Create.validate(req.body)
    if (error) {
      return res.status(400).send(error.message)
    }

    const { userId } = req.body
    const conversation = await this.conversations.create(req.client!.id, userId)

    res.send(conversation)
  }

  async get(req: ClientApiRequest, res: Response) {
    const { error } = Schema.Api.Get.validate(req.params)
    if (error) {
      return res.status(400).send(error.message)
    }

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
    const { error } = Schema.Api.List.validate({ query: req.query, params: req.params })
    if (error) {
      return res.status(400).send(error.message)
    }

    const { id } = req.params
    const { limit } = req.query

    const conversations = await this.conversations.listByUserId(req.client!.id, id as string, <any>limit || 20)
    res.send(conversations)
  }

  async recent(req: ClientApiRequest, res: Response) {
    const { error } = Schema.Api.Recent.validate(req.params)
    if (error) {
      return res.status(400).send(error.message)
    }

    const { id } = req.params
    let conversation = await this.conversations.getMostRecent(req.client!.id, id)
    if (!conversation) {
      conversation = await this.conversations.create(req.client!.id, id)
    }

    res.send(conversation)
  }
}
