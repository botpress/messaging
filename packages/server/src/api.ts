import cors from 'cors'
import express, { Request, Response, Router } from 'express'
import { Server } from 'http'
import { App } from './app'
import { ChannelApi } from './channels/api'
import { ChatApi } from './chat/api'
import { ConversationApi } from './conversations/api'
import { HealthApi } from './health/api'
import { MessageApi } from './messages/api'
import { SyncApi } from './sync/api'
import { UserApi } from './users/api'

const pkg = require('../package.json')

export class Api {
  private router: Router

  syncs: SyncApi
  health: HealthApi
  chat: ChatApi
  users: UserApi
  conversations: ConversationApi
  messages: MessageApi
  channels: ChannelApi

  constructor(private app: App, private root: Router) {
    this.router = Router()
    this.syncs = new SyncApi(this.router, this.app.config, this.app.syncs, this.app.clients, this.app.channels)
    this.health = new HealthApi(this.router, this.app.clients, this.app.health)
    this.chat = new ChatApi(
      this.router,
      this.app.clients,
      this.app.channels,
      this.app.conduits,
      this.app.instances,
      this.app.conversations
    )
    this.users = new UserApi(this.router, this.app.clients, this.app.users)
    this.conversations = new ConversationApi(this.router, this.app.clients, this.app.conversations)
    this.messages = new MessageApi(this.router, this.app.clients, this.app.conversations, this.app.messages)
    this.channels = new ChannelApi(this.root, this.app)
  }

  async setup() {
    await this.setupPassword()

    this.root.get('/version', this.version)
    this.root.get('/status', this.status)
    this.root.use('/api', this.router)
    this.router.use(cors())
    this.router.use(express.json())
    this.router.use(express.urlencoded({ extended: true }))

    await this.syncs.setup()
    await this.health.setup()
    await this.chat.setup()
    await this.users.setup()
    await this.conversations.setup()
    await this.messages.setup()
    await this.channels.setup()
  }

  async setupSocket(server: Server) {
    await this.users.setupSocket(server)
  }

  async setupPassword() {
    const password = process.env.INTERNAL_PASSWORD || this.app.config.current.security?.password
    if (!password) {
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

  private status(_req: Request, res: Response) {
    res.sendStatus(200)
  }

  private version(_req: Request, res: Response) {
    res.send(pkg.version)
  }
}
