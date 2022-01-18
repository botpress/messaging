import { getTableId, Migration } from '@botpress/messaging-engine'

export class InitMigration extends Migration {
  meta = {
    name: InitMigration.name,
    description: 'Create initial tables',
    version: '0.0.1'
  }

  async valid() {
    return true
  }

  async applied() {
    return this.isDown
  }

  async up() {
    await this.trx.schema.createTable(getTableId('msg_meta'), (table) => {
      table.timestamp('time').primary()
      table.jsonb('data')
    })

    await this.trx.schema.createTable(getTableId('msg_kvs'), (table) => {
      table.uuid('id').primary()
      table.string('key').unique().notNullable()
      table.jsonb('value').notNullable()
    })

    await this.trx.schema.createTable(getTableId('msg_channels'), (table) => {
      table.uuid('id').primary()
      table.string('name').unique().notNullable()
      table.boolean('lazy').notNullable()
      table.boolean('initiable').notNullable()
    })

    await this.trx.schema.createTable(getTableId('msg_providers'), (table) => {
      table.uuid('id').primary()
      table.string('name').unique().notNullable()
      table.boolean('sandbox').notNullable()
    })

    await this.trx.schema.createTable(getTableId('msg_clients'), (table) => {
      table.uuid('id').primary()
      table.uuid('providerId').references('id').inTable(getTableId('msg_providers')).unique().nullable()
      table.string('token').unique().notNullable()
    })

    await this.trx.schema.createTable(getTableId('msg_webhooks'), (table) => {
      table.uuid('id').primary()
      table.uuid('clientId').references('id').inTable(getTableId('msg_clients')).notNullable()
      table.string('url').notNullable()
      table.string('token').notNullable()
    })

    await this.trx.schema.createTable(getTableId('msg_conduits'), (table) => {
      table.uuid('id').primary()
      table.uuid('providerId').references('id').inTable(getTableId('msg_providers')).notNullable()
      table.uuid('channelId').references('id').inTable(getTableId('msg_channels')).notNullable()
      table.timestamp('initialized').nullable()
      table.text('config').notNullable()
      table.unique(['providerId', 'channelId'])
      table.index(['initialized'])
      table.index(['channelId'])
    })

    await this.trx.schema.createTable(getTableId('msg_users'), (table) => {
      table.uuid('id').primary()
      table.uuid('clientId').references('id').inTable(getTableId('msg_clients')).notNullable()
    })

    await this.trx.schema.createTable(getTableId('msg_conversations'), (table) => {
      table.uuid('id').primary()
      table.uuid('clientId').references('id').inTable(getTableId('msg_clients')).notNullable()
      table.uuid('userId').references('id').inTable(getTableId('msg_users')).notNullable()
      table.timestamp('createdOn').notNullable()
      table.index(['userId', 'clientId'])
    })

    await this.trx.schema.createTable(getTableId('msg_messages'), (table) => {
      table.uuid('id').primary()
      table
        .uuid('conversationId')
        .references('id')
        .inTable(getTableId('msg_conversations'))
        .notNullable()
        .onDelete('cascade')
      table.uuid('authorId').references('id').inTable(getTableId('msg_users')).nullable()
      table.timestamp('sentOn').notNullable()
      table.jsonb('payload').notNullable()
      table.index(['conversationId', 'sentOn'])
    })

    await this.trx.schema.createTable(getTableId('msg_tunnels'), (table) => {
      table.uuid('id').primary()
      table.uuid('clientId').references('id').inTable(getTableId('msg_clients')).notNullable()
      table.uuid('channelId').references('id').inTable(getTableId('msg_channels')).notNullable()
      table.unique(['clientId', 'channelId'])
    })

    await this.trx.schema.createTable(getTableId('msg_identities'), (table) => {
      table.uuid('id').primary()
      table.uuid('tunnelId').references('id').inTable(getTableId('msg_tunnels')).notNullable()
      table.string('name').notNullable()
      table.unique(['tunnelId', 'name'])
    })

    await this.trx.schema.createTable(getTableId('msg_senders'), (table) => {
      table.uuid('id').primary()
      table.uuid('identityId').references('id').inTable(getTableId('msg_identities')).notNullable()
      table.string('name').notNullable()
      table.unique(['identityId', 'name'])
    })

    await this.trx.schema.createTable(getTableId('msg_threads'), (table) => {
      table.uuid('id').primary()
      table.uuid('senderId').references('id').inTable(getTableId('msg_senders')).notNullable()
      table.string('name').notNullable()
      table.unique(['senderId', 'name'])
    })

    await this.trx.schema.createTable(getTableId('msg_usermap'), (table) => {
      table.uuid('tunnelId').references('id').inTable(getTableId('msg_tunnels')).notNullable()
      table.uuid('userId').references('id').inTable(getTableId('msg_users')).notNullable()
      table.uuid('senderId').references('id').inTable(getTableId('msg_senders')).notNullable()
      table.unique(['tunnelId', 'userId'])
      table.unique(['tunnelId', 'senderId'])
    })

    await this.trx.schema.createTable(getTableId('msg_convmap'), (table) => {
      table.uuid('tunnelId').references('id').inTable(getTableId('msg_tunnels')).notNullable()
      table.uuid('conversationId').references('id').inTable(getTableId('msg_conversations')).notNullable()
      table.uuid('threadId').references('id').inTable(getTableId('msg_threads')).notNullable()
      table.unique(['tunnelId', 'conversationId'])
      table.unique(['tunnelId', 'threadId'])
    })

    await this.trx.schema.createTable(getTableId('msg_sandboxmap'), (table) => {
      table.uuid('conduitId').references('id').inTable(getTableId('msg_conduits')).notNullable()
      table.string('identity').notNullable()
      table.string('sender').notNullable()
      table.string('thread').notNullable()
      table.uuid('clientId').references('id').inTable(getTableId('msg_clients')).notNullable()
      table.primary(['conduitId', 'identity', 'sender', 'thread'])
    })

    await this.trx.schema.createTable(getTableId('msg_status'), (table) => {
      table.uuid('conduitId').primary().references('id').inTable(getTableId('msg_conduits')).onDelete('cascade')
      table.integer('numberOfErrors').defaultTo(0)
      table.text('lastError')
    })

    await this.trx.schema.createTable(getTableId('msg_health'), (table) => {
      table.uuid('id').primary()
      table.uuid('conduitId').references('id').inTable(getTableId('msg_conduits')).notNullable().onDelete('cascade')
      table.timestamp('time').notNullable()
      table.string('type').notNullable()
      table.jsonb('data').nullable()
      table.index(['conduitId', 'time'])
    })
  }

  async down() {
    await this.trx.schema.dropTable(getTableId('msg_health'))
    await this.trx.schema.dropTable(getTableId('msg_status'))
    await this.trx.schema.dropTable(getTableId('msg_sandboxmap'))
    await this.trx.schema.dropTable(getTableId('msg_convmap'))
    await this.trx.schema.dropTable(getTableId('msg_usermap'))
    await this.trx.schema.dropTable(getTableId('msg_threads'))
    await this.trx.schema.dropTable(getTableId('msg_senders'))
    await this.trx.schema.dropTable(getTableId('msg_identities'))
    await this.trx.schema.dropTable(getTableId('msg_tunnels'))
    await this.trx.schema.dropTable(getTableId('msg_messages'))
    await this.trx.schema.dropTable(getTableId('msg_conversations'))
    await this.trx.schema.dropTable(getTableId('msg_users'))
    await this.trx.schema.dropTable(getTableId('msg_conduits'))
    await this.trx.schema.dropTable(getTableId('msg_webhooks'))
    await this.trx.schema.dropTable(getTableId('msg_clients'))
    await this.trx.schema.dropTable(getTableId('msg_providers'))
    await this.trx.schema.dropTable(getTableId('msg_channels'))
    await this.trx.schema.dropTable(getTableId('msg_kvs'))
    await this.trx.schema.dropTable(getTableId('msg_meta'))
  }
}
