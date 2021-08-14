import { uuid } from '@botpress/messaging-base'
import { Router } from 'express'
import { ApiRequest, ClientScopedApi } from '../base/api'
import { ClientService } from '../clients/service'
import { ConversationService } from '../conversations/service'
import { InstanceService } from '../instances/service'
import { SocketManager } from '../socket/manager'
import { CreateMsgSchema, DeleteMsgSchema, GetMsgSchema, ListMsgSchema } from './schema'
import { MessageService } from './service'

export class MessageApi extends ClientScopedApi {
  constructor(
    router: Router,
    clients: ClientService,
    private sockets: SocketManager,
    private conversations: ConversationService,
    private messages: MessageService,
    // garbadge code, this shouldn't be here but whatever
    private instances: InstanceService
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

    this.sockets.handle('messages.create', async (socket, message) => {
      // TODO: safety

      const { clientId, userId, conversationId, payload } = message.data

      const msg = await this.messages.create(conversationId, userId, payload)
      this.sockets.reply(socket, message, msg)

      await this.instances.sendToWebhooks({
        clientId,
        userId,
        conversationId,
        message: msg,
        channel: 'socket'
      })
    })

    this.sockets.handle('messages.list', async (socket, message) => {
      // TODO: safety

      const { conversationId } = message.data

      const messages = await this.messages.listByConversationId(conversationId)
      this.sockets.reply(socket, message, messages)
    })
  }
}
