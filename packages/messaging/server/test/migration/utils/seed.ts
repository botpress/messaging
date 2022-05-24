import { DatabaseService } from '@botpress/engine'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { v4 as uuid } from 'uuid'

// TODO: Seed all the table that exists on the first database schema
const entities = {
  providers: {
    table: 'msg_providers',
    quantity: 10
  },
  clients: {
    table: 'msg_clients'
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
    quantity: 10
  }
}

/**
 * Seeder for the original Messaging database schema
 */
export class Seed {
  constructor(private database: DatabaseService) {}

  public async run(): Promise<void> {
    // TODO: Get or create?
    // When seeding, the database is empty so we need to create this hard-coded channel manually
    const channelTelegram = {
      id: '0198f4f5-6100-4549-92e5-da6cc31b4ad1',
      name: 'telegram',
      lazy: true,
      initiable: true
    }
    await this.database.knex(entities.channels.table).insert(channelTelegram)

    const providers = this.providers()
    await this.database.knex(entities.providers.table).insert(providers)

    const clients = this.clients(providers)
    await this.database.knex(entities.clients.table).insert(clients)

    const conduits = this.conduits(providers, channelTelegram)
    await this.database.knex(entities.conduits.table).insert(conduits)

    const status = this.status(conduits)
    await this.database.knex(entities.status.table).insert(status)

    const webhooks = await this.webhooks(clients)
    await this.database.knex(entities.webhooks).insert(webhooks)

    const users = this.users(clients)
    await this.database.knex(entities.users.table).insert(users)
  }

  private providers(): any[] {
    const providers: any[] = []
    for (let i = 0; i < entities.providers.quantity; i++) {
      providers.push({ id: uuid(), name: uuid(), sandbox: this.database.setBool(false) as boolean })
    }

    return providers
  }

  private clients(providers: any[]): any[] {
    const clients: any[] = []

    for (const provider of providers) {
      clients.push({ id: uuid(), token: uuid(), providerId: provider.id })
    }

    for (let i = 0; i < entities.providers.quantity; i++) {
      clients.push({ id: uuid(), token: uuid() })
    }

    return clients
  }

  private conduits(providers: any[], telegram: any): any[] {
    const conduits: any[] = []
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

  private status(conduits: any[]): any[] {
    const status: any[] = []
    for (const conduit of conduits) {
      const numberOfErrors = Math.floor(Math.random() * 5) // random number between 0 and 5
      const isErrored = numberOfErrors > 0

      status.push({
        conduitId: conduit.id,
        numberOfErrors,
        lastError: isErrored ? 'an error' : undefined
      })
    }

    return status
  }

  private async webhooks(clients: any[]): Promise<any[]> {
    const webhook: any[] = []
    for (const client of clients) {
      const token = await this._generateToken()
      webhook.push({ id: uuid(), clientId: client.id, url: '', token })
    }

    return webhook
  }

  private users(clients: any[]): any[] {
    const users: any[] = []
    for (const client of clients) {
      for (let i = 0; i < entities.users.quantity; i++) {
        users.push({ id: uuid(), clientId: client.id })
      }
    }

    return users
  }

  private async _generateToken({ hash }: { hash: boolean } = { hash: false }): Promise<string> {
    const token = crypto.randomBytes(66).toString('base64')

    if (hash) {
      return bcrypt.hash(token, 10)
    }

    return token
  }
}
