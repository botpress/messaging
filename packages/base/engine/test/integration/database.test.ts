import { Knex } from 'knex'
import { DatabaseService, Table } from '../../src'
import { setupApp, destroyApp, engine } from '../utils'

describe('DatabaseService', () => {
  const testTableName = 'test'
  let database: DatabaseService

  beforeAll(async () => {
    await setupApp()

    database = engine.database
  })

  afterAll(async () => {
    await destroyApp()
  })

  const getTables = async (): Promise<any[]> => {
    if (database.getIsLite()) {
      return database.knex.select('*').from('sqlite_master').where({ type: 'table' })
    } else {
      return database.knex.select('*').from('information_schema.tables').where({ table_schema: 'public' })
    }
  }

  describe('Setup', () => {
    beforeAll(async () => {
      // Destroys the connection created by setupApp
      await database.knex.destroy()
    })

    afterEach(async () => {
      // Makes sure to destroy new connections created by calls to setup
      await database.knex.destroy()
    })

    afterAll(async () => {
      process.env.DATABASE_POOL = undefined

      // Puts the connection back to its original state
      await database.setup()
    })

    it('Should setup the database connection', async () => {
      await database.setup()

      expect(database.knex).toBeDefined()
    })

    it('Should setup the database pool options', async () => {
      const json = { min: 1, max: 1 }
      process.env.DATABASE_POOL = JSON.stringify(json)
      await database.setup()

      expect(database['pool']).toEqual({ log: expect.anything(), ...json })
    })

    it('Should not setup the pool options if they are invalid', async () => {
      const invalidJson = '"'
      process.env.DATABASE_POOL = invalidJson
      await database.setup()

      expect(database['pool']).toEqual({ log: expect.anything() })
    })
  })

  describe('RegisterTable', () => {
    it('Should register a table', async () => {
      const count = database['tables'].length

      class Test extends Table {
        get name() {
          return testTableName
        }

        create(table: Knex.CreateTableBuilder) {
          table.uuid('id').primary()
        }
      }

      const table = new Test()
      await database.registerTable(table)

      const tables = database['tables']
      expect(tables.length).toEqual(count + 1)
    })
  })

  describe('CreateTables', () => {
    test('Should create all tables that were registered', async () => {
      const count = database['tables'].length
      expect(count).toBeGreaterThan(0)

      const trx = await database.knex.transaction()
      await database.createTables(trx)
      await trx.commit()

      const tables = await getTables()
      expect(tables.length).toEqual(count)
    }, 30_000)

    test('Should only create tables once', async () => {
      const count = database['tables'].length
      expect(count).toBeGreaterThan(0)

      let tables = await getTables()
      expect(tables.length).toEqual(count)

      const trx = await database.knex.transaction()
      await database.createTables(trx)
      await trx.commit()

      tables = await getTables()
      expect(tables.length).toEqual(count)
    }, 30_000)
  })

  describe('GetIsLite', () => {
    test('Should return true if database is lite', async () => {
      expect(database.getIsLite()).toEqual(!process.env.DATABASE_URL!.startsWith('postgres'))
    })
  })

  describe('GetJson', () => {
    test('Should return json object', async () => {
      const json = { joe: 'bob' }
      const string = JSON.stringify(json)

      if (database.getIsLite()) {
        expect(database.getJson(string)).toEqual(json)
      } else {
        expect(database.getJson(json)).toEqual(json)
      }
    })

    test('Should return undefined when value is undefined', async () => {
      const string = undefined
      expect(database.getJson(string)).toBeUndefined()
    })
  })

  describe('SetJson', () => {
    test('Should return a string from some object', async () => {
      const json = { joe: 'bob' }
      const string = JSON.stringify(json)

      if (database.getIsLite()) {
        expect(database.setJson(json)).toEqual(string)
      } else {
        expect(database.setJson(json)).toEqual(json)
      }
    })

    test('Should return undefined when value is undefined', async () => {
      const json = undefined
      expect(database.setJson(json)).toBeUndefined()
    })
  })

  describe('GetDate', () => {
    test('Should return a date from a string', async () => {
      const date = new Date()
      const string = date.toISOString()

      expect(database.getDate(string)).toEqual(date)
    })
  })

  describe('SetDate', () => {
    test('Should return a string from a date', async () => {
      const date = new Date()
      const string = date.toISOString()

      expect(database.setDate(date)).toEqual(string)
    })

    test('Should return undefined if the data is undefined', async () => {
      const date = undefined

      expect(database.setDate(date)).toBeUndefined()
    })
  })

  describe('GetBool', () => {
    test('Should return a boolean from a boolean', async () => {
      const bool = true

      expect(database.getBool(bool)).toEqual(bool)
    })

    test('Should return a boolean from a number', async () => {
      const bool = 1

      expect(database.getBool(bool)).toEqual(!!bool)
    })
  })

  describe('SetBool', () => {
    test('Should return a boolean (or a number) from a boolean', async () => {
      const bool = true

      if (database.getIsLite()) {
        expect(database.setBool(bool)).toEqual(Number(bool))
      } else {
        expect(database.setBool(bool)).toEqual(bool)
      }
    })
  })

  describe('Destroy', () => {
    test('Should not delete table if the database is not transient', async () => {
      process.env.DATABASE_TRANSIENT = 'false'

      await database.destroy()

      await database.setup()
      const tables = await getTables()
      expect(tables.length).toBeGreaterThan(0)
    })

    test('Should fail to delete tables if destroy is called twice', async () => {
      await database.destroy()

      process.env.DATABASE_TRANSIENT = 'true'
      await expect(database.destroy()).rejects.toThrow('Unable to acquire a connection')

      await database.setup()
      const tables = await getTables()
      expect(tables.length).toBeGreaterThan(0)
    })

    test('Should delete tables if the database is transient', async () => {
      process.env.DATABASE_TRANSIENT = 'true'

      await database.destroy()

      await database.setup()
      const tables = await getTables()
      expect(tables.length).toEqual(0)
    }, 30_000)
  })
})
