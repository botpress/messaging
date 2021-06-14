import express, { Router } from 'express'
import { App } from './app'
import { ChannelApi } from './channels/api'
import { ClientApi } from './clients/api'
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

    this.providers = new ProviderApi(this.router, app.providers)
    this.conduits = new ConduitApi(this.router, app.channels, app.providers, app.conduits)
    this.clients = new ClientApi(this.router, app.channels, app.providers, app.conduits, app.clients)
    this.conversations = new ConversationApi(this.router, app.clients, app.conversations)
    this.messages = new MessageApi(this.router, app.clients, app.channels, app.conduits, app.messages)
    this.channels = new ChannelApi(this.root, this.app)
  }

  async setup() {
    this.root.use('/api', this.router)
    this.router.use(express.json())
    this.router.use(express.urlencoded({ extended: true }))

    await this.providers.setup()
    await this.conduits.setup()
    await this.clients.setup()
    await this.conversations.setup()
    await this.messages.setup()
    await this.channels.setup()
  }
}
