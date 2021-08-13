import { uuid } from '@botpress/messaging-base'
import { Router } from 'express'
import { Socket } from 'socket.io'
import { ApiRequest, ClientScopedApi } from '../base/api'
import { ClientService } from '../clients/service'
import { ConversationService } from '../conversations/service'
import { CreateMsgSchema, DeleteMsgSchema, GetMsgSchema, ListMsgSchema } from './schema'
import { MessageService } from './service'

export class MessageApi extends ClientScopedApi {
  constructor(
    router: Router,
    clients: ClientService,
    private conversations: ConversationService,
    private messages: MessageService
  ) {
    super(router, clients)
  }

  async setup() {
    this.router.use('/messages', this.extractClient.bind(this))

    this.router.post(
      '/messages',
      this.asyncMiddleware(async (req: ApiRequest, res) => {
        const { error } = CreateMsgSchema.validate(req.body)
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

        const message = await this.messages.create(conversationId, authorId, payload)

        res.send(message)
      })
    )

    this.router.get(
      '/messages/:id',
      this.asyncMiddleware(async (req: ApiRequest, res) => {
        const { error } = GetMsgSchema.validate(req.params)
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
      })
    )

    this.router.get(
      '/messages/',
      this.asyncMiddleware(async (req: ApiRequest, res) => {
        const { error } = ListMsgSchema.validate(req.query)
        if (error) {
          return res.status(400).send(error.message)
        }

        const { conversationId, limit } = req.query
        const conversation = await this.conversations.get(conversationId as uuid)

        if (!conversation) {
          return res.sendStatus(404)
        } else if (conversation.clientId !== req.client!.id) {
          return res.sendStatus(403)
        }

        const messages = await this.messages.listByConversationId(conversationId as uuid, +(limit as string))

        res.send(messages)
      })
    )

    this.router.delete(
      '/messages',
      this.asyncMiddleware(async (req: ApiRequest, res) => {
        const { error } = DeleteMsgSchema.validate(req.query)
        if (error) {
          return res.status(400).send(error.message)
        }

        const { id, conversationId } = req.query
        let deleted: number

        if (id) {
          const message = await this.messages.get(id as uuid)
          if (!message) {
            return res.sendStatus(400)
          }

          const conversation = await this.conversations.get(message.conversationId)
          if (conversation!.clientId !== req.client!.id) {
            return res.sendStatus(403)
          }

          deleted = await this.messages.delete(id as uuid)
        } else if (conversationId) {
          const conversation = await this.conversations.get(conversationId as string)

          if (!conversation) {
            return res.sendStatus(400)
          } else if (conversation!.clientId !== req.client!.id) {
            return res.sendStatus(403)
          }

          deleted = await this.messages.deleteByConversationId(conversationId as uuid)
        } else {
          return res.sendStatus(400)
        }

        res.send({ count: deleted })
      })
    )
  }

  async handle(socket: Socket, message: SocketRequest<SocketCreateMessageRequest>) {
    if (message.type === 'create-message') {
      const { conversationId, authorId, payload } = message.data

      // TODO: safety checks

      socket.emit('message', {
        request: message.request,
        type: 'use-convo',
        data: await this.messages.create(conversationId, authorId, payload)
      })
    } else if (message.type === 'list-messages') {
      const { conversationId } = message.data

      // TODO: safety checks

      socket.emit('message', {
        request: message.request,
        type: 'list-messages',
        data: await this.messages.listByConversationId(conversationId)
      })
    }
  }
}

interface SocketRequest<T> {
  request: string
  type: string
  data: T
}

interface SocketCreateMessageRequest {
  clientId: uuid
  userId: uuid
  conversationId: uuid
  authorId: uuid
  payload: any
}
