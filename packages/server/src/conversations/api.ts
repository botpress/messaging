import { Router } from 'express'
import { ApiRequest, ClientScopedApi } from '../base/api'
import { ClientService } from '../clients/service'
import { SocketManager } from '../socket/manager'
import { SocketService } from '../socket/service'
import { UserService } from '../users/service'
import { CreateConvoSchema, GetConvoSchema, ListConvosSchema, RecentConvoSchema, UseConvoSocketSchema } from './schema'
import { ConversationService } from './service'

export class ConversationApi extends ClientScopedApi {
  constructor(
    router: Router,
    clients: ClientService,
    private sockets: SocketManager,
    private users: UserService,
    private conversations: ConversationService,
    private socketService: SocketService
  ) {
    super(router, clients)
  }

  async setup() {
    this.router.use('/conversations', this.extractClient.bind(this))

    this.router.post(
      '/conversations',
      this.asyncMiddleware(async (req: ApiRequest, res) => {
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
      this.asyncMiddleware(async (req: ApiRequest, res) => {
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
      this.asyncMiddleware(async (req: ApiRequest, res) => {
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
      this.asyncMiddleware(async (req: ApiRequest, res) => {
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

    this.sockets.handle('conversations.use', async (socket, message) => {
      const { error } = UseConvoSocketSchema.validate(message.data)
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
      const { conversationId }: { conversationId?: string } = message.data

      const user = await this.users.get(userId)
      let conversation = conversationId && (await this.conversations.get(conversationId))

      if (!conversation || conversation.userId !== userId) {
        conversation = await this.conversations.create(user!.clientId, userId)
      }

      this.sockets.reply(socket, message, conversation)
    })
  }
}
