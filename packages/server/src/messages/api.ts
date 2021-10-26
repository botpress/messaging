import { uuid } from '@botpress/messaging-base'
import { Router, Response } from 'express'
import { Auth } from '../base/auth/auth'
import { ClientApiRequest } from '../base/auth/client'
import { ConversationService } from '../conversations/service'
import { ConverseService } from '../converse/service'
import { Schema } from './schema'
import { MessageService } from './service'

export class MessageApi {
  constructor(
    private router: Router,
    private auth: Auth,
    private conversations: ConversationService,
    private messages: MessageService,
    private converse: ConverseService
  ) {}

  async setup() {
    this.router.post('/messages', this.auth.client.auth(this.create.bind(this)))
    this.router.post('/messages/collect', this.auth.client.auth(this.collect.bind(this)))
    this.router.get('/messages/:id', this.auth.client.auth(this.get.bind(this)))
    this.router.get('/messages/conversation/:id', this.auth.client.auth(this.list.bind(this)))
    this.router.delete('/messages/:id', this.auth.client.auth(this.delete.bind(this)))
    this.router.delete('/messages/conversation/:id', this.auth.client.auth(this.deleteByConversation.bind(this)))
  }

  async create(req: ClientApiRequest, res: Response) {
    const { error } = Schema.Api.Create.validate(req.body)
    if (error) {
      return res.status(400).send(error.message)
    }

    const { conversationId, authorId, payload } = req.body
    const conversation = await this.conversations.get(conversationId)

    if (!conversation) {
      return res.sendStatus(404)
    } else if (conversation.clientId !== req.client!.id) {
      return res.sendStatus(403)
    }

    const source = authorId
      ? undefined
      : {
          client: { id: req.client!.id }
        }
    const message = await this.messages.create(conversationId, authorId, payload, source)

    res.send(message)
  }

  async collect(req: ClientApiRequest, res: Response) {
    const { error } = Schema.Api.Collect.validate(req.body)
    if (error) {
      return res.status(400).send(error.message)
    }

    const { conversationId, authorId, payload } = req.body
    const conversation = await this.conversations.get(conversationId)

    if (!conversation) {
      return res.sendStatus(404)
    } else if (conversation.clientId !== req.client!.id) {
      return res.sendStatus(403)
    }

    const collector = this.converse.collect(conversationId)
    await this.messages.create(conversationId, authorId, payload)

    res.send(await collector)
  }

  async get(req: ClientApiRequest, res: Response) {
    const { error } = Schema.Api.Get.validate(req.params)
    if (error) {
      return res.status(400).send(error.message)
    }

    const { id } = req.params
    const message = await this.messages.get(id)

    if (!message) {
      return res.sendStatus(404)
    }

    const conversation = await this.conversations.get(message.conversationId)
    if (conversation!.clientId !== req.client!.id) {
      return res.sendStatus(403)
    }

    res.send(message)
  }

  async list(req: ClientApiRequest, res: Response) {
    const { error } = Schema.Api.List.validate({ query: req.query, params: req.params })
    if (error) {
      return res.status(400).send(error.message)
    }

    const { id } = req.params
    const { limit } = req.query

    const conversation = await this.conversations.get(id as uuid)

    if (!conversation) {
      return res.sendStatus(404)
    } else if (conversation.clientId !== req.client!.id) {
      return res.sendStatus(403)
    }

    const messages = await this.messages.listByConversationId(id as uuid, <any>limit || 20)
    res.send(messages)
  }

  async delete(req: ClientApiRequest, res: Response) {
    const { error } = Schema.Api.Delete.validate(req.params)
    if (error) {
      return res.status(400).send(error.message)
    }

    const { id } = req.params
    const message = await this.messages.get(id)
    if (!message) {
      return res.sendStatus(400)
    }

    const conversation = await this.conversations.get(message.conversationId)
    if (conversation!.clientId !== req.client!.id) {
      return res.sendStatus(403)
    }

    const deleted = await this.messages.delete(id)
    res.send({ count: deleted })
  }

  async deleteByConversation(req: ClientApiRequest, res: Response) {
    const { error } = Schema.Api.DeleteByConversation.validate(req.params)
    if (error) {
      return res.status(400).send(error.message)
    }

    const { id } = req.params
    const conversation = await this.conversations.get(id)

    if (!conversation) {
      return res.sendStatus(400)
    } else if (conversation!.clientId !== req.client!.id) {
      return res.sendStatus(403)
    }

    const deleted = await this.messages.deleteByConversationId(id)
    res.send({ count: deleted })
  }
}
