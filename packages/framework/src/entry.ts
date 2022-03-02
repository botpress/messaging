import { Migration } from '@botpress/messaging-engine'
import express, { Express } from 'express'
import { AdminApiManager, ApiManager } from './base/api-manager'
import { Auth } from './base/auth/auth'
import { ClientApi } from './clients/api'
import { Framework } from './framework'
import { Routes } from './routes'

export abstract class Entry {
  abstract get name(): string
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
    tapi: { new (app: any, manager: ApiManager): IApp },
    tstream: { new (app: any): IApp },
    tsocket: { new (app: any): IApp }
  ) {
    this.router = express()
    this.router.disable('x-powered-by')
    this.routes = new Routes(this.router)

    this.app = new tapp()
    this.api = new tapi(this.app, new ApiManager(this.routes.router, new Auth(this.app.clientTokens)))
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

  async destroy() {
    await this.stream?.destroy()
    // TODO
    // await this.socket.manager.destroy()
  }

  async postDestroy() {
    await this.app?.destroy()
  }
}

export interface IApp {}
