import { Migration } from '@botpress/messaging-engine'
import express, { Express } from 'express'
import { Server } from 'http'
import { AdminApiManager, ApiManager } from './base/api-manager'
import { Auth } from './base/auth/auth'
import { ClientApi } from './clients/api'
import { Framework } from './framework'
import { Routes } from './routes'

export abstract class Entry {
  abstract get name(): string
  abstract get port(): number
  abstract get package(): any
  abstract get migrations(): { new (): Migration }[]

  router: Express
  routes: Routes

  // TODO: typings for this
  app: Framework
  api: any
  stream: any
  socket: any

  clients: ClientApi

  constructor(
    tapp: { new (): Framework },
    tapi: { new (app: any, manager: ApiManager, express: Express): any },
    tstream: { new (app: any): any },
    tsocket: { new (app: any): any }
  ) {
    this.router = express()
    this.router.disable('x-powered-by')
    this.routes = new Routes(this.router)

    this.app = new tapp()
    this.api = new tapi(this.app, new ApiManager(this.routes.router, new Auth(this.app.clientTokens)), this.router)
    this.stream = new tstream(this.app)
    this.socket = new tsocket(this.app)

    this.clients = new ClientApi(this.app.clients, this.app.clientTokens)
  }

  async setup() {
    await this.app.prepare(this.package, this.migrations)
    await this.app.setup()
    await this.app.postSetup()

    this.routes.setup(this.package)
    this.clients.setup(new AdminApiManager(this.routes.router, new Auth(this.app.clientTokens)))
    await this.api.setup()
    this.routes.postSetup()

    await this.stream.setup()
    await this.socket.setup()
  }

  async start(server: Server) {
    await this.socket.start(server)
  }

  async monitor() {
    await this.app.monitor()
  }

  async terminate() {
    await this.stream?.destroy()
    await this.socket?.destroy()
  }

  async destroy() {
    await this.app?.preDestroy()
    await this.app?.destroy()
    await this.app?.postDestroy()
  }
}
