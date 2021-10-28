import * as Sentry from '@sentry/node'
import cors from 'cors'
import express, { Request, Response, Router } from 'express'
import yn from 'yn'
import { App } from './app'
import { Auth } from './base/auth/auth'
import { ChannelApi } from './channels/api'
import { ConversationApi } from './conversations/api'
import { HealthApi } from './health/api'
import { MessageApi } from './messages/api'
import { SocketManager } from './socket/manager'
import { SyncApi } from './sync/api'
import { UserApi } from './users/api'

export class Api {
  public readonly sockets: SocketManager

  private router: Router
  private auth: Auth

  private syncs: SyncApi
  private health: HealthApi
  private users: UserApi
  private conversations: ConversationApi
  private messages: MessageApi
  private channels: ChannelApi

  constructor(private app: App, private root: Router) {
    this.router = Router()
    this.auth = new Auth(app.clients)
    this.sockets = new SocketManager(this.app.sockets)
    this.syncs = new SyncApi(this.router, this.auth, this.app.syncs, this.app.clients, this.app.channels)
    this.health = new HealthApi(this.router, this.auth, this.app.health)
    this.users = new UserApi(
      this.router,
      this.auth,
      this.app.clients,
      this.sockets,
      this.app.users,
      this.app.userTokens,
      this.app.sockets
    )
    this.conversations = new ConversationApi(
      this.router,
      this.auth,
      this.sockets,
      this.app.users,
      this.app.conversations,
      this.app.sockets
    )
    this.messages = new MessageApi(
      this.router,
      this.auth,
      this.sockets,
      this.app.conversations,
      this.app.messages,
      this.app.converse,
      this.app.sockets
    )
    this.channels = new ChannelApi(this.root, this.app)
  }

  async setup() {
    this.setupApm()
    await this.setupPassword()

    this.root.get('/version', this.version.bind(this))
    this.root.get('/status', this.status)
    this.root.use('/api', this.router)
    this.router.use(cors())
    this.router.use(express.json())
    this.router.use(express.urlencoded({ extended: true }))

    await this.syncs.setup()
    await this.health.setup()
    await this.users.setup()
    await this.conversations.setup()
    await this.messages.setup()
    await this.channels.setup()

    this.setupApmErrorHandler()
  }

  setupApm() {
    const apmEnabled = yn(process.env.APM_ENABLED)

    if (apmEnabled) {
      Sentry.init({
        integrations: [new Sentry.Integrations.Http({})]
      })

      this.root.use(Sentry.Handlers.requestHandler())
    }
  }

  setupApmErrorHandler() {
    const apmEnabled = yn(process.env.APM_ENABLED)

    if (apmEnabled) {
      this.root.use(Sentry.Handlers.errorHandler())
    }
  }

  async setupPassword() {
    const password = process.env.INTERNAL_PASSWORD
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
    res.send(this.app.meta.app().version)
  }
}
