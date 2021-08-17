import { Router } from 'express'
import { ApiRequest, ClientScopedApi } from '../base/api'
import { ClientService } from '../clients/service'
import { ConversationService } from '../conversations/service'
import { ChatReplySchema } from './schema'
import { ChatService } from './service'

export class ChatApi extends ClientScopedApi {
  constructor(
    router: Router,
    clients: ClientService,
    private conversations: ConversationService,
    private chat: ChatService
  ) {
    super(router, clients)
  }

  async setup() {
    this.router.use('/chat', this.extractClient.bind(this))

    this.router.post(
      '/chat/reply',
      this.asyncMiddleware(async (req: ApiRequest, res) => {
        const { error } = ChatReplySchema.validate(req.body)
        if (error) {
          return res.status(400).send(error.message)
        }

        const { conversationId, payload } = req.body
        const conversation = await this.conversations.get(conversationId)

        if (!conversation) {
          return res.sendStatus(400)
        } else if (conversation.clientId !== req.client!.id) {
          return res.sendStatus(403)
        }

        const message = await this.chat.send(conversationId, undefined, payload, { clientId: req.client!.id })

        res.send(message)
      })
    )
  }
}
