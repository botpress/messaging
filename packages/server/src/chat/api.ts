import { Router } from 'express'
import { ApiRequest, ClientScopedApi } from '../base/api'
import { ChannelService } from '../channels/service'
import { ClientService } from '../clients/service'
import { ConduitService } from '../conduits/service'
import { ConversationService } from '../conversations/service'
import { InstanceService } from '../instances/service'
import { MessageService } from '../messages/service'
import { SocketManager } from '../socket/manager'
import { ChatReplySchema } from './schema'

export class ChatApi extends ClientScopedApi {
  constructor(
    router: Router,
    clients: ClientService,
    private sockets: SocketManager,
    private channels: ChannelService,
    private conduits: ConduitService,
    private instances: InstanceService,
    private conversations: ConversationService,
    private messages: MessageService
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

        const { channel, conversationId, payload } = req.body
        const conversation = await this.conversations.get(conversationId)

        if (!conversation) {
          return res.sendStatus(400)
        } else if (conversation.clientId !== req.client!.id) {
          return res.sendStatus(403)
        }

        const channelId = this.channels.getByName(channel).id

        // TODO: this is terrible
        let message
        if (channel !== 'socket') {
          const conduit = (await this.conduits.getByProviderAndChannel(req.client!.providerId, channelId))!
          message = await this.instances.send(conduit.id, conversationId, payload)
        } else {
          message = await this.messages.create(conversationId, undefined, payload)
          this.sockets.get(conversation.id).send({ type: 'message', data: message })
        }

        res.send(message)
      })
    )
  }
}
