import { uuid } from '@botpress/messaging-base'
import { Response } from 'express'
import { v4 as uuidv4 } from 'uuid'
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
    router.get('/messages/conversation/:conversationId', Schema.Api.List, this.list.bind(this))
    router.delete('/messages/:id', Schema.Api.Delete, this.delete.bind(this))
    router.delete(
      '/messages/conversation/:conversationId',
      Schema.Api.DeleteByConversation,
      this.deleteByConversation.bind(this)
    )
    router.post('/messages/turn/:id', Schema.Api.Turn, this.turn.bind(this))
  }

  async create(req: ClientApiRequest, res: Response) {
    const { conversationId, authorId, payload, incomingId } = req.body as {
      conversationId: uuid
      authorId: uuid
      payload: any
      incomingId: uuid
    }

    const conversation = await this.conversations.get(conversationId)
    if (!conversation || conversation.clientId !== req.client.id) {
      return res.sendStatus(404)
    }

    const messageId = uuidv4()
    if (incomingId) {
      this.converse.setIncomingId(messageId, incomingId)
    }

    const source = authorId
      ? undefined
      : {
          client: { id: req.client!.id }
        }
    const message = await this.messages.create(conversationId, authorId, payload, source, messageId)

    res.status(201).send(message)
  }

  async collect(req: ClientApiRequest, res: Response) {
    const { conversationId, authorId, payload, timeout } = req.body as {
      conversationId: uuid
      authorId: uuid
      payload: any
      timeout: string
    }

    const conversation = await this.conversations.get(conversationId)
    if (!conversation || conversation.clientId !== req.client.id) {
      return res.sendStatus(404)
    }

    const messageId = uuidv4()
    const collector = this.converse.collect(messageId, conversationId, +timeout)
    const message = await this.messages.create(conversationId, authorId, payload, undefined, messageId)

    res.send({ message, responses: await collector })
  }

  async get(req: ClientApiRequest, res: Response) {
    const id = req.params.id as uuid

    const message = await this.messages.get(id)
    if (!message) {
      return res.send(undefined)
    }

    const conversation = await this.conversations.get(message.conversationId)
    if (!conversation || conversation.clientId !== req.client.id) {
      return res.send(undefined)
    }

    res.send(message)
  }

  async list(req: ClientApiRequest, res: Response) {
    const conversationId = req.params.conversationId as uuid
    const limit = +(req.query.limit || 20)

    const conversation = await this.conversations.get(conversationId)
    if (!conversation || conversation.clientId !== req.client.id) {
      return res.sendStatus(404)
    }

    const messages = await this.messages.listByConversationId(conversationId, limit)
    res.send(messages)
  }

  async delete(req: ClientApiRequest, res: Response) {
    const { id } = req.params

    const message = await this.messages.get(id)
    if (!message) {
      return res.send(false)
    }

    const conversation = await this.conversations.get(message.conversationId)
    if (!conversation || conversation.clientId !== req.client.id) {
      return res.send(false)
    }

    await this.messages.delete(id)
    res.send(true)
  }

  async deleteByConversation(req: ClientApiRequest, res: Response) {
    const { conversationId } = req.params

    const conversation = await this.conversations.get(conversationId)
    if (!conversation || conversation.clientId !== req.client.id) {
      return res.sendStatus(404)
    }

    const deleted = await this.messages.deleteByConversationId(conversationId)
    res.send({ count: deleted })
  }

  async turn(req: ClientApiRequest, res: Response) {
    const { id } = req.params

    const message = await this.messages.get(id)
    if (!message) {
      return res.sendStatus(404)
    }

    const conversation = await this.conversations.get(message.conversationId)
    if (!conversation) {
      return res.sendStatus(404)
    } else if (conversation.clientId !== req.client!.id) {
      return res.sendStatus(403)
    }

    await this.converse.stopCollecting(message.id, message.conversationId)
    res.sendStatus(200)
  }
}
