import { ApiManager } from '@botpress/framework'
import { Express } from 'express'
import { App } from './app'
import { ChannelApi } from './channels/api'
import { ConversationApi } from './conversations/api'
import { HealthApi } from './health/api'
import { MappingApi } from './mapping/api'
import { MessageApi } from './messages/api'
import { SyncApi } from './sync/api'
import { UserApi } from './users/api'

export class Api {
  private channels: ChannelApi

  private syncs: SyncApi
  private health: HealthApi
  private users: UserApi
  private conversations: ConversationApi
  private messages: MessageApi
  private mapping: MappingApi

  constructor(private app: App, private manager: ApiManager, private express: Express) {
    this.channels = new ChannelApi(this.express, this.app)

    this.syncs = new SyncApi(this.app.syncs, this.app.channels)
    this.health = new HealthApi(this.app.health)
    this.users = new UserApi(this.app.users)
    this.conversations = new ConversationApi(this.app.users, this.app.conversations)
    this.messages = new MessageApi(this.app.users, this.app.conversations, this.app.messages, this.app.converse)
    this.mapping = new MappingApi(this.app.channels, this.app.conversations, this.app.mapping)
  }

  async setup() {
    await this.channels.setup()

    this.syncs.setup(this.manager)
    this.health.setup(this.manager)
    this.users.setup(this.manager)
    this.conversations.setup(this.manager)
    this.messages.setup(this.manager)
    this.mapping.setup(this.manager)
  }
}
