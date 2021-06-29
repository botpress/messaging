import express, { Router } from 'express'
import { App } from './app'
import { ChannelApi } from './channels/api'
import { ConversationApi } from './conversations/api'
import { MessageApi } from './messages/api'
import { SyncApi } from './sync/api'

export class Api {
  private router!: Router

  syncs: SyncApi
  conversations: ConversationApi
  messages: MessageApi
  channels: ChannelApi

  constructor(private app: App, private root: Router) {
    this.router = Router()

    this.syncs = new SyncApi(this.router, app.syncs)
    this.conversations = new ConversationApi(this.router, app.clients, app.conversations)
    this.messages = new MessageApi(this.router, app.clients, app.channels, app.conduits, app.instances, app.messages)
    this.channels = new ChannelApi(this.root, this.app)
  }

  async setup() {
    const password = process.env.INTERNAL_PASSWORD || this.app.config.current.security?.password

    if (password) {
      this.root.use('/api', (req, res, next) => {
        if (req.headers.password === password) {
          next()
        } else {
          res.sendStatus(403)
        }
      })
    }

    this.root.use('/api', this.router)
    this.router.use(express.json())
    this.router.use(express.urlencoded({ extended: true }))

    await this.syncs.setup()
    await this.conversations.setup()
    await this.messages.setup()
    await this.channels.setup()
  }
}
