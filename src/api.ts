import express, { Router } from 'express'
import { App } from './app'
import { ChannelApi } from './channels/api'
import { ChatApi } from './chat/api'
import { ConversationApi } from './conversations/api'
import { MessageApi } from './messages/api'
import { SyncApi } from './sync/api'

export class Api {
  private router: Router

  syncs: SyncApi
  chat: ChatApi
  conversations: ConversationApi
  messages: MessageApi
  channels: ChannelApi

  constructor(private app: App, private root: Router) {
    this.router = Router()
    this.syncs = new SyncApi(this.router, this.app.syncs)
    this.chat = new ChatApi(this.router, this.app.clients, this.app.channels, this.app.conduits, this.app.instances)
    this.conversations = new ConversationApi(this.router, this.app.clients, this.app.conversations)
    this.messages = new MessageApi(this.router, this.app.clients, this.app.messages)
    this.channels = new ChannelApi(this.root, this.app)
  }

  async setup() {
    await this.setupPassword()

    this.root.use('/api', this.router)
    this.router.use(express.json())
    this.router.use(express.urlencoded({ extended: true }))

    await this.syncs.setup()
    await this.chat.setup()
    await this.conversations.setup()
    await this.messages.setup()
    await this.channels.setup()
  }

  async setupPassword() {
    const password = process.env.INTERNAL_PASSWORD || this.app.config.current.security?.password
    if (password) {
      return
    }

    this.root.use('/api', (req, res, next) => {
      if (req.headers.password === password) {
        next()
      } else {
        res.sendStatus(403)
      }
    })
  }
}
