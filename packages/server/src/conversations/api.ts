import { Router } from 'express'
import { Auth } from '../base/auth/auth'
import { SocketManager } from '../socket/manager'
import { UserService } from '../users/service'
import {
  CreateConvoSchema,
  CreateConvoSocketSchema,
  DeleteConvoSocketSchema,
  GetConvoSchema,
  GetConvoSocketSchema,
  ListConvoSocketSchema,
  ListConvosSchema,
  RecentConvoSchema
} from './schema'
import { ConversationService } from './service'

export class ConversationApi {
  constructor(
    private router: Router,
    private auth: Auth,
    private sockets: SocketManager,
    private users: UserService,
    private conversations: ConversationService
  ) {}

  async setup() {
    this.router.post(
      '/conversations',
      this.auth.client.auth(async (req, res) => {
        const { error } = CreateConvoSchema.validate(req.body)
        if (error) {
          return res.status(400).send(error.message)
        }

        const { userId } = req.body
        const conversation = await this.conversations.create(req.client!.id, userId)

        res.send(conversation)
      })
    )

    this.router.get(
      '/conversations/:id',
      this.auth.client.auth(async (req, res) => {
        const { error } = GetConvoSchema.validate(req.params)
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
      })
    )

    this.router.get(
      '/conversations/',
      this.auth.client.auth(async (req, res) => {
        const { error } = ListConvosSchema.validate(req.query)
        if (error) {
          return res.status(400).send(error.message)
        }

        const { userId, limit } = req.query
        const conversations = await this.conversations.listByUserId(
          req.client!.id,
          userId as string,
          +(limit as string)
        )

        res.send(conversations)
      })
    )

    this.router.get(
      '/conversations/:userId/recent',
      this.auth.client.auth(async (req, res) => {
        const { error } = RecentConvoSchema.validate(req.params)
        if (error) {
          return res.status(400).send(error.message)
        }

        const { userId } = req.params
        let conversation = await this.conversations.getMostRecent(req.client!.id, userId)
        if (!conversation) {
          conversation = await this.conversations.create(req.client!.id, userId)
        }

        res.send(conversation)
      })
    )

    this.sockets.handle('conversations.create', CreateConvoSocketSchema, async (socket) => {
      const user = await this.users.get(socket.userId)
      const conversation = await this.conversations.create(user!.clientId, user!.id)

      socket.reply(conversation)
    })

    this.sockets.handle('conversations.get', GetConvoSocketSchema, async (socket) => {
      const { id } = socket.data
      const conversation = await this.conversations.get(id)

      if (!conversation || conversation.userId !== socket.userId) {
        return socket.reply(undefined)
      }

      socket.reply(conversation)
    })

    this.sockets.handle('conversations.list', ListConvoSocketSchema, async (socket) => {
      const { limit } = socket.data

      const user = await this.users.get(socket.userId)
      const conversations = await this.conversations.listByUserId(user!.clientId, socket.userId, +limit)

      socket.reply(conversations)
    })

    this.sockets.handle('conversations.delete', DeleteConvoSocketSchema, async (socket) => {
      const { id } = socket.data
      const conversation = await this.conversations.get(id)

      if (!conversation) {
        return socket.reply(false)
      } else if (conversation.userId !== socket.userId) {
        return socket.forbid('Conversation does not belong to user')
      }

      const deleted = await this.conversations.delete(id)
      socket.reply(deleted > 0)
    })
  }
}
