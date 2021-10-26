import { uuid } from '@botpress/messaging-base'
import { Response } from 'express'
import { ApiManager } from '../base/api-manager'
import { ClientApiRequest } from '../base/auth/client'
import { ConversationService } from '../conversations/service'
import { ConverseService } from '../converse/service'
import { Schema } from './schema'
import { MessageService } from './service'

export class MessageApi {
  constructor(
    private conversations: ConversationService,
    private messages: MessageService,
    private converse: ConverseService
  ) {}

  setup(router: ApiManager) {
    router.post('/messages', Schema.Api.Create, this.create.bind(this))
    router.post('/messages/collect', Schema.Api.Collect, this.collect.bind(this))
    router.get('/messages/:id', Schema.Api.Get, this.get.bind(this))
    router.get('/messages/conversation/:id', Schema.Api.List, this.list.bind(this))
    router.delete('/messages/:id', Schema.Api.Delete, this.delete.bind(this))
    router.delete('/messages/conversation/:id', Schema.Api.DeleteByConversation, this.deleteByConversation.bind(this))
  }

  async create(req: ClientApiRequest, res: Response) {
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
