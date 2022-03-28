import * as Sentry from '@sentry/node'
import cors from 'cors'
import express, { Request, Response, Router } from 'express'
import yn from 'yn'
import { App } from './app'
import { AdminApiManager, ApiManager } from './base/api-manager'
import { Auth } from './base/auth/auth'
import { ChannelApi } from './channels/api'
import { ClientApi } from './clients/api'
import { ConversationApi } from './conversations/api'
import { HealthApi } from './health/api'
import { MappingApi } from './mapping/api'
import { MessageApi } from './messages/api'
import { SyncApi } from './sync/api'
import { UserTokenApi } from './user-tokens/api'
import { UserApi } from './users/api'

export class Api {
  private router: Router
  private auth: Auth
  private adminManager: AdminApiManager
  private manager: ApiManager

  private clients: ClientApi
  private syncs: SyncApi
  private health: HealthApi
  private users: UserApi
  private userTokens: UserTokenApi
  private conversations: ConversationApi
  private messages: MessageApi
  private mapping: MappingApi
  private channels: ChannelApi

  constructor(private app: App, private root: Router) {
    this.router = Router()
    this.auth = new Auth(this.app.clientTokens)
    this.adminManager = new AdminApiManager(this.router, this.auth)
    this.manager = new ApiManager(this.router, this.auth)

    this.clients = new ClientApi(this.app.providers, this.app.clients, this.app.clientTokens, this.app.provisions)
    this.syncs = new SyncApi(this.app.syncs, this.app.channels)
    this.health = new HealthApi(this.app.health)
    this.users = new UserApi(this.app.users)
    this.userTokens = new UserTokenApi(this.app.users, this.app.userTokens)
    this.conversations = new ConversationApi(this.app.users, this.app.conversations)
    this.messages = new MessageApi(this.app.users, this.app.conversations, this.app.messages, this.app.converse)
    this.mapping = new MappingApi(this.app.channels, this.app.conversations, this.app.mapping)

    this.channels = new ChannelApi(this.root, this.app)
  }

  async setup() {
    this.setupApm()
    await this.setupPassword()

    this.root.get('/version', this.version.bind(this))
    this.root.get('/status', this.status.bind(this))
    this.root.use('/api/v1', this.router)
    this.root.use('/api', this.router)
    this.router.use(
      cors({
        origin: '*',
        methods: ['GET', 'POST', 'DELETE'],
        allowedHeaders: '*'
      })
    )
    this.router.use(express.json({ limit: '100kb' }))
    this.router.use(express.urlencoded({ extended: true }))

    this.clients.setup(this.manager, this.adminManager)
    this.syncs.setup(this.manager)
    this.health.setup(this.manager)
    this.users.setup(this.manager)
    this.userTokens.setup(this.manager)
    this.conversations.setup(this.manager)
    this.messages.setup(this.manager)
    this.mapping.setup(this.manager)

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
