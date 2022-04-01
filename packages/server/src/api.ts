import { AdminApiManager, ApiManager, Auth } from '@botpress/messaging-framework'
import * as Sentry from '@sentry/node'
import cors from 'cors'
import express, { Request, Response, Router } from 'express'
import yn from 'yn'
import { App } from './app'
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
  private clients: ClientApi
  private syncs: SyncApi
  private health: HealthApi
  private users: UserApi
  private userTokens: UserTokenApi
  private conversations: ConversationApi
  private messages: MessageApi
  private mapping: MappingApi
  private channels: ChannelApi

  constructor(
    private app: App,
    private manager: ApiManager,
    private adminManager: AdminApiManager,
    private root: Router
  ) {
    this.clients = new ClientApi(this.app.providers, this.app.clients, this.app.provisions)
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
    this.clients.setup(this.manager, this.adminManager)
    this.syncs.setup(this.manager)
    this.health.setup(this.manager)
    this.users.setup(this.manager)
    this.userTokens.setup(this.manager)
    this.conversations.setup(this.manager)
    this.messages.setup(this.manager)
    this.mapping.setup(this.manager)
    await this.channels.setup()
  }
}
