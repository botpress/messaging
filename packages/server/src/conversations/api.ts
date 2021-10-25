import { Router } from 'express'
import { Auth } from '../base/auth/auth'
import { SocketManager } from '../socket/manager'
import { SocketService } from '../socket/service'
import { UserService } from '../users/service'
import {
  CreateConvoSchema,
  CreateConvoSocketSchema,
  DeleteConvoSocketSchema,
  GetConvoSchema,
  GetConvoSocketSchema,
  ListConvoSocketSchema,
  ListConvosSchema,
  RecentConvoSchema,
  UseConvoSocketSchema
} from './schema'
import { ConversationService } from './service'

export class ConversationApi {
  constructor(
    private router: Router,
    private auth: Auth,
    private sockets: SocketManager,
    private users: UserService,
    private conversations: ConversationService,
    private socketService: SocketService
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

    this.sockets.handle('conversations.create', async (socket, message) => {
      const { error } = CreateConvoSocketSchema.validate(message.data)
      if (error) {
        return this.sockets.reply(socket, message, { error: true, message: error.message })
      }

      const userId = this.socketService.getUserId(socket)
      if (!userId) {
        return this.sockets.reply(socket, message, {
          error: true,
          message: 'socket does not have user rights'
        })
      }

      const user = await this.users.get(userId)
      const conversation = await this.conversations.create(user!.clientId, user!.id)

      this.sockets.reply(socket, message, conversation)
    })

    this.sockets.handle('conversations.get', async (socket, message) => {
      const { error } = GetConvoSocketSchema.validate(message.data)
      if (error) {
        return this.sockets.reply(socket, message, { error: true, message: error.message })
      }

      const userId = this.socketService.getUserId(socket)
      if (!userId) {
        return this.sockets.reply(socket, message, {
          error: true,
          message: 'socket does not have user rights'
        })
      }

      const { id } = message.data
      const conversation = await this.conversations.get(id)

      if (!conversation || conversation.userId !== userId) {
        return this.sockets.reply(socket, message, undefined)
      }

      this.sockets.reply(socket, message, conversation)
    })

    this.sockets.handle('conversations.list', async (socket, message) => {
      const { error } = ListConvoSocketSchema.validate(message.data)
      if (error) {
        return this.sockets.reply(socket, message, { error: true, message: error.message })
      }

      const userId = this.socketService.getUserId(socket)
      if (!userId) {
        return this.sockets.reply(socket, message, {
          error: true,
          message: 'socket does not have user rights'
        })
      }

      const { limit } = message.data
      const user = await this.users.get(userId)
      this.sockets.reply(socket, message, await this.conversations.listByUserId(user!.clientId, userId, +limit))
    })

    this.sockets.handle('conversations.delete', async (socket, message) => {
      const { error } = DeleteConvoSocketSchema.validate(message.data)
      if (error) {
        return this.sockets.reply(socket, message, { error: true, message: error.message })
      }

      const userId = this.socketService.getUserId(socket)
      if (!userId) {
        return this.sockets.reply(socket, message, {
          error: true,
          message: 'socket does not have user rights'
        })
      }

      const { id } = message.data
      const conversation = await this.conversations.get(id)

      if (!conversation) {
        return this.sockets.reply(socket, message, false)
      } else if (conversation.userId !== userId) {
        return this.sockets.reply(socket, message, {
          error: true,
          message: 'conversation does not belong to user'
        })
      }

      const deleted = await this.conversations.delete(id)
      this.sockets.reply(socket, message, deleted > 0)
    })
  }
}
