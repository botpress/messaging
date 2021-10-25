import { uuid } from '@botpress/messaging-base'
import { Router } from 'express'
import { Auth } from '../base/auth/auth'
import { ConversationService } from '../conversations/service'
import { ConverseService } from '../converse/service'
import { SocketManager } from '../socket/manager'
import {
  CreateMsgSchema,
  CreateMsgSocketSchema,
  DeleteMsgSchema,
  GetMsgSchema,
  ListMsgSchema,
  ListMsgSocketSchema
} from './schema'
import { MessageService } from './service'

export class MessageApi {
  constructor(
    private router: Router,
    private auth: Auth,
    private sockets: SocketManager,
    private conversations: ConversationService,
    private messages: MessageService,
    private converse: ConverseService
  ) {}

  async setup() {
    this.router.post(
      '/messages',
      this.auth.client.auth(async (req, res) => {
        const { error } = CreateMsgSchema.validate(req.body)
        if (error) {
          return res.status(400).send(error.message)
        }

        const { conversationId, authorId, payload, collect } = req.body
        const conversation = await this.conversations.get(conversationId)

        if (!conversation) {
          return res.sendStatus(404)
        } else if (conversation.clientId !== req.client!.id) {
          return res.sendStatus(403)
        }

        const collector = collect ? this.converse.collect(conversationId) : undefined

        const message = await this.messages.create(
          conversationId,
          authorId,
          payload,
          authorId
            ? undefined
            : {
                client: { id: req.client!.id }
              }
        )

        if (collect) {
          res.send(await collector)
        } else {
          res.send(message)
        }
      })
    )

    this.router.get(
      '/messages/:id',
      this.auth.client.auth(async (req, res) => {
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
      '/messages',
      this.auth.client.auth(async (req, res) => {
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
      this.auth.client.auth(async (req, res) => {
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

    this.sockets.handle('messages.create', CreateMsgSocketSchema, async (socket) => {
      const { conversationId, payload } = socket.data
      const conversation = await this.conversations.get(conversationId)

      if (!conversation || conversation.userId !== socket.userId) {
        return socket.notFound('Conversation does not exist')
      }

      const message = await this.messages.create(conversationId, socket.userId, payload, {
        socket: { id: socket.socket.id }
      })
      socket.reply(message)
    })

    this.sockets.handle('messages.list', ListMsgSocketSchema, async (socket) => {
      const { conversationId, limit } = socket.data
      const conversation = await this.conversations.get(conversationId)

      if (!conversation || conversation.userId !== socket.userId) {
        return socket.notFound('Conversation does not exist')
      }

      const messages = await this.messages.listByConversationId(conversationId, limit)
      socket.reply(messages)
    })
  }
}
