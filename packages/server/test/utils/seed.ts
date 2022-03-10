import { User } from '@botpress/messaging-base'
import { DatabaseService } from '@botpress/messaging-engine/src/database/service'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { v4 as uuid } from 'uuid'

import { ChannelMeta } from '../../../channels/src/base/meta'
import { ClientToken } from '../../src/client-tokens/types'
import { Client } from '../../src/clients/types'
import { Conduit } from '../../src/conduits/types'
import { Provider } from '../../src/providers/types'
import { Provision } from '../../src/provisions/types'
import { ConduitStatus } from '../../src/status/types'
import { UserToken } from '../../src/user-tokens/types'
import { Webhook } from '../../src/webhooks/types'

const entities = {
  providers: {
    table: 'msg_providers',
    quantity: 100
  },
  clients: {
    table: 'msg_clients'
  },
  provisions: {
    table: 'msg_provisions'
  },
  clientTokens: {
    table: 'msg_client_tokens'
  },
  conduits: {
    table: 'msg_conduits'
  },
  channels: {
    table: 'msg_channels'
  },
  status: {
    table: 'msg_status'
  },
  webhooks: {
    table: 'msg_webhooks'
  },
  users: {
    table: 'msg_users',
    quantity: 1
  },
  userTokens: {
    table: 'msg_user_tokens'
  }
}

export class Seed {
  constructor(private database: DatabaseService) {}

  public async run(): Promise<void> {
    const channelTelegram: ChannelMeta = await this.database
      .knex(entities.channels.table)
      .where({ name: 'telegram' })
      .first()

    const providers = this.providers()
    await this.database.knex(entities.providers.table).insert(providers)

    const clients = this.clients()
    await this.database.knex(entities.clients.table).insert(clients)

    const provisions = this.provisions(providers, clients)
    await this.database.knex(entities.provisions.table).insert(provisions)

    const clientTokens = await this.clientTokens(clients)
    await this.database.knex(entities.clientTokens.table).insert(clientTokens)

    const conduits = this.conduits(providers, channelTelegram)
    await this.database.knex(entities.conduits.table).insert(conduits)

    const status = this.status(conduits)
    await this.database.knex(entities.status.table).insert(status)

    const webhooks = await this.webhooks(clients)
    await this.database.knex(entities.webhooks).insert(webhooks)

    const users = this.users(clients)
    await this.database.knex(entities.users.table).insert(users)

    const userTokens = await this.userTokens(users)
    await this.database.knex(entities.userTokens.table).insert(userTokens)
  }

  private providers(): Provider[] {
    const providers: Provider[] = []
    for (let i = 0; i < entities.providers.quantity; i++) {
      providers.push({ id: uuid(), name: uuid(), sandbox: this.database.setBool(false) as boolean })
    }

    return providers
  }

  private clients(): Client[] {
    const clients: Client[] = []
    for (let i = 0; i < entities.providers.quantity; i++) {
      clients.push({ id: uuid() })
    }

    return clients
  }

  private provisions(providers: Provider[], clients: Client[]): Provision[] {
    const provisions: Provision[] = []
    for (let i = 0; i < entities.providers.quantity; i++) {
      provisions.push({ providerId: providers[i].id, clientId: clients[i].id })
    }

    return provisions
  }

  private async clientTokens(clients: Client[]): Promise<ClientToken[]> {
    const clientToken: ClientToken[] = []
    for (const client of clients) {
      const token = await this._generateToken({ hash: true })
      clientToken.push({ id: uuid(), clientId: client.id, token, expiry: undefined })
    }

    return clientToken
  }

  private conduits(providers: Provider[], telegram: ChannelMeta): Conduit[] {
    const conduits: Conduit[] = []
    for (const provider of providers) {
      conduits.push({
        id: uuid(),
        providerId: provider.id,
        channelId: telegram.id,
        config: this.database.setJson({ enabled: false, botToken: uuid() })
      })
    }

    return conduits
  }

  private status(conduits: Conduit[]): ConduitStatus[] {
    const status: ConduitStatus[] = []
    for (const conduit of conduits) {
      const numberOfErrors = Math.floor(Math.random() * 5) // random number between 0 and 5
      const isErrored = numberOfErrors > 0

      status.push({
        conduitId: conduit.id,
        numberOfErrors,
        initializedOn: !isErrored ? new Date() : undefined,
        lastError: isErrored ? 'an error' : undefined
      })
    }

    return status
  }

  private async webhooks(clients: Client[]): Promise<Webhook[]> {
    const webhook: Webhook[] = []
    for (const client of clients) {
      const token = await this._generateToken()
      webhook.push({ id: uuid(), clientId: client.id, url: '', token })
    }

    return webhook
  }

  private users(clients: Client[]): User[] {
    const users: User[] = []
    for (const client of clients) {
      for (let i = 0; i < entities.users.quantity; i++) {
        users.push({ id: uuid(), clientId: client.id })
      }
    }

    return users
  }

  private async userTokens(users: User[]): Promise<UserToken[]> {
    const userTokens: UserToken[] = []
    for (const user of users) {
      const token = await this._generateToken({ hash: true })
      userTokens.push({ id: uuid(), userId: user.id, token, expiry: undefined })
    }

    return userTokens
  }

  private async _generateToken({ hash }: { hash: boolean } = { hash: false }): Promise<string> {
    const token = crypto.randomBytes(66).toString('base64')

    if (hash) {
      return bcrypt.hash(token, 10)
    }

    return token
  }
}
