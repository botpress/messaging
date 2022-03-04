import knex from 'knex'
import path from 'path'

export const setupConnection = async (prefix: string) => {
  const databaseURL =
    process.env.DATABASE_URL || path.join(__dirname, './../../../../../test/.test-data', `${prefix}.sqlite`)

  if (databaseURL.startsWith('postgres')) {
    return knex({
      client: 'postgres',
      connection: databaseURL,
      useNullAsDefault: true
    })
  }

  return knex({
    client: 'sqlite3',
    connection: { filename: databaseURL },
    useNullAsDefault: true
  })
}
