import express, { Router, Request, Response, NextFunction } from 'express'
import { App } from './app'
import { ChannelApi } from './channels/api'
import { ClientApi } from './clients/api'
import { Client } from './clients/types'
import { ConduitApi } from './conduits/api'
import { ConversationApi } from './conversations/api'
import { MessageApi } from './messages/api'
import { ProviderApi } from './providers/api'

export class Api {
  private router!: Router

  providers: ProviderApi
  conduits: ConduitApi
  clients: ClientApi

  conversations: ConversationApi
  messages: MessageApi
  channels: ChannelApi

  constructor(private app: App, private root: Router) {
    this.router = Router()

    this.providers = new ProviderApi(this.root, app.providers)
    this.conduits = new ConduitApi(this.root, app.channels, app.providers, app.conduits)
    this.clients = new ClientApi(this.root, app.providers, app.clients)

    this.conversations = new ConversationApi(this.router, app.clients, app.conversations)
    this.messages = new MessageApi(this.router, app.clients, app.messages)
    this.channels = new ChannelApi(this.root, this.app)
  }

  async setup() {
    this.root.use('/api', this.extractClient.bind(this), this.router)
    this.router.use(express.json())
    this.router.use(express.urlencoded({ extended: true }))

    await this.providers.setup()
    await this.conduits.setup()
    await this.clients.setup()
    await this.conversations.setup()
    await this.messages.setup()
    await this.channels.setup()

    this.router.post('/send', async (req: ApiRequest, res) => {
      const { channel, conversationId, payload } = req.body

      const channelId = this.app.channels.getByName(channel).id
      const conduit = await this.app.conduits.getInstanceByProviderId(req.client!.providerId, channelId)
      await conduit.send(conversationId, payload)

      res.sendStatus(200)
    })
  }

  async extractClient(req: ApiRequest, res: Response, next: NextFunction) {
    const authorization = req.headers.authorization
    const [_, auth] = authorization!.split(' ')
    const [clientId, clientToken] = Buffer.from(auth, 'base64').toString('utf-8').split(':')

    const client = await this.app.clients.getByIdAndToken(clientId, clientToken)

    if (!client) {
      return res.sendStatus(403)
    } else {
      req.client = client
      next()
    }
  }
}

export type ApiRequest = Request & {
  client?: Client
}
