import { Router } from 'express'
import { ApiRequest, ClientScopedApi } from '../base/api'
import { ChatApi } from '../chat/api'
import { ClientService } from '../clients/service'
import { SocketManager } from '../socket/manager'
import { CreateConvoSchema, GetConvoSchema, ListConvosSchema, RecentConvoSchema } from './schema'
import { ConversationService } from './service'

export class ConversationApi extends ClientScopedApi {
  constructor(
    router: Router,
    clients: ClientService,
    private sockets: SocketManager,
    private conversations: ConversationService,
    private chat: ChatApi
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

    this.sockets.handle('use-convo', async (socket, message) => {
      if (message.data.conversationId) {
        const conversation = await this.conversations.get(message.data.conversationId)
        if (conversation) {
          this.chat.registerSocket(socket, conversation.id)
          socket.emit('message', {
            request: message.request,
            type: 'use-convo',
            data: conversation
          })
        }
      }

      const conversation = await this.conversations.create(message.data.clientId, message.data.userId)
      this.chat.registerSocket(socket, conversation.id)
      socket.emit('message', {
        request: message.request,
        type: 'use-convo',
        data: conversation
      })
    })
  }
}
