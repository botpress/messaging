import fs from 'fs'
import { mocked } from 'jest-mock'
import { Knex } from 'knex'
import _ from 'lodash'
import * as path from 'path'

import { Table } from '../../src/base/table'
import { DatabaseService } from '../../src/database/service'

jest.mock('../../src/logger/types')
jest.mock('fs')
jest.mock('knex', () => {
  const mKnexSchema = { hasTable: jest.fn(), createTable: jest.fn() }
  const mKnex = { destroy: jest.fn(), schema: mKnexSchema }

  return jest.fn(({ pool }) => {
    pool.afterCreate?.({ run: jest.fn() }, jest.fn())

    return mKnex
  })
})

export class TestTable extends Table {
  get name() {
    return 'test_table'
  }

  create(table: Knex.CreateTableBuilder) {
    table.uuid('id').primary()
  }
}

const table = new TestTable()
const defaultEnv = process.env
const postgresDatabaseUrl = 'postgres://user:pass@url:123/db'
const poolOptions = '{ "min": 0, "max": 7 }'
const invalidPoolOptions = '{ min: 0, max: 7 }'
const sqlitePath = 'a/path/sqlite.core'
const anyValue = 2
const date = new Date()
const stringDate = date.toISOString()
const obj = { a: 'value' }
const stringObj = JSON.stringify(obj)
const falsyValues = ['', null, undefined, false]

describe('DatabaseService', () => {
  beforeEach(() => {
    process.env = { ..._.cloneDeep(process.env) }

    jest.useFakeTimers()
  })

  afterEach(() => {
    process.env = defaultEnv

    jest.useRealTimers()
  })

  test('Should not throw any error with a default configuration', () => {
    try {
      new DatabaseService()
    } catch (e) {
      fail(e)
    }
  })

  describe('PostgreSQL', () => {
    beforeEach(() => {
      process.env.DATABASE_URL = postgresDatabaseUrl
    })

    describe('setup', () => {
      test('Should configure a PostgreSQL database connection from an env var', async () => {
        const db = new DatabaseService()
        await db.setup()

        expect(Object.keys(db['pool'])).toEqual(['log'])
        expect(db['isLite']).toEqual(false)
        expect(db['url']).toEqual(postgresDatabaseUrl)
        expect(db.knex).not.toBeUndefined()
      })

      test('Should configure a PostgreSQL database connection with custom pool options', async () => {
        process.env.DATABASE_POOL = poolOptions
        const jsonPoolOptions = JSON.parse(poolOptions)

        const db = new DatabaseService()
        await db.setup()

        expect(Object.keys(db['pool'])).toEqual(['log', ...Object.keys(jsonPoolOptions)])
        expect(db['pool']).toEqual(expect.objectContaining(jsonPoolOptions))
        expect(db['isLite']).toEqual(false)
        expect(db['url']).toEqual(postgresDatabaseUrl)
        expect(db.knex).not.toBeUndefined()
      })

      test('Should configure a PostgreSQL database connection with no extra pool options', async () => {
        process.env.DATABASE_POOL = '{}'

        const db = new DatabaseService()
        await db.setup()

        expect(Object.keys(db['pool'])).toEqual(['log'])
        expect(db['isLite']).toEqual(false)
        expect(db['url']).toEqual(postgresDatabaseUrl)
        expect(db.knex).not.toBeUndefined()
      })

      test('Should display a warning if the custom pool options are invalid JSON', async () => {
        process.env.DATABASE_POOL = invalidPoolOptions

        const db = new DatabaseService()
        await db.setup()

        expect(db['logger'].warn).toHaveBeenCalledTimes(1)
        expect(Object.keys(db['pool'])).toEqual(['log'])
        expect(db['isLite']).toEqual(false)
        expect(db['url']).toEqual(postgresDatabaseUrl)
        expect(db.knex).not.toBeUndefined()
      })
    })

    describe('destroy', () => {
      test('Should call destroy on knex', async () => {
        const db = new DatabaseService()
        await db.setup()

        mocked(db.knex.destroy).mockReturnValueOnce(Promise.resolve())

        await db.destroy()

        expect(db.knex.destroy).toHaveBeenCalledTimes(1)
        expect(db['logger'].error).not.toHaveBeenCalled()
      })

      test('Should call the logger if an error is thrown', async () => {
        const db = new DatabaseService()
        await db.setup()

        mocked(db.knex.destroy).mockImplementationOnce(Promise.reject)

        await db.destroy()

        expect(db.knex.destroy).toHaveBeenCalledTimes(1)
        expect(db['logger'].error).toHaveBeenCalledTimes(1)
      })
    })

    describe('getJson', () => {
      test('Should return the value as is', async () => {
        const db = new DatabaseService()
        await db.setup()

        expect(db.getJson(anyValue)).toEqual(anyValue)
      })
    })

    describe('setJson', () => {
      test('Should return the value as is', async () => {
        const db = new DatabaseService()
        await db.setup()

        expect(db.setJson(anyValue)).toEqual(anyValue)
      })
    })

    describe('getDate', () => {
      test('Should convert a string into a new Date', async () => {
        const db = new DatabaseService()
        await db.setup()

        expect(db.getDate(stringDate)).toEqual(date)
      })
    })

    describe('setDate', () => {
      test('Should convert a string into a new Date', async () => {
        const db = new DatabaseService()
        await db.setup()

        expect(db.setDate(date)).toEqual(stringDate)
      })

      test('Should return undefined if no date is provided', async () => {
        const db = new DatabaseService()
        await db.setup()

        expect(db.setDate(undefined)).toEqual(undefined)
      })
    })

    describe('getBool', () => {
      test('Should return the boolean as is', async () => {
        const db = new DatabaseService()
        await db.setup()

        expect(db.getBool(true)).toEqual(true)
        expect(db.getBool(false)).toEqual(false)
      })
    })

    describe('setBool', () => {
      test('Should return the boolean as is', async () => {
        const db = new DatabaseService()
        await db.setup()

        expect(db.setBool(true)).toEqual(true)
        expect(db.setBool(false)).toEqual(false)
      })
    })
  })

  describe('SQLite', () => {
    beforeEach(() => {
      process.env.DATABASE_URL = undefined
    })

    describe('setup', () => {
      test('Should configure a SQLite database connection', async () => {
        mocked(fs.existsSync).mockReturnValueOnce(true)

        const db = new DatabaseService()
        await db.setup()

        expect(Object.keys(db['pool'])).toEqual(['log'])
        expect(db['isLite']).toEqual(true)
        expect(db['url']).toBeUndefined()
        expect(fs.existsSync).toHaveBeenCalledTimes(1)
        expect(fs.existsSync).toHaveBeenCalledWith(expect.stringContaining('dist'))
        expect(db.knex).not.toBeUndefined()
      })

      test('Should configure a SQLite database connection for production', async () => {
        process.env.NODE_ENV = 'production'

        mocked(fs.existsSync).mockReturnValueOnce(false)
        mocked(fs.mkdirSync).mockReturnValueOnce(undefined)

        const db = new DatabaseService()
        await db.setup()

        expect(Object.keys(db['pool'])).toEqual(['log'])
        expect(db['isLite']).toEqual(true)
        expect(db['url']).toBeUndefined()
        expect(fs.existsSync).toHaveBeenCalledTimes(1)
        expect(fs.existsSync).toHaveBeenCalledWith(expect.not.stringContaining('dist'))
        expect(fs.mkdirSync).toHaveBeenCalledTimes(1)
        expect(fs.mkdirSync).toHaveBeenCalledWith(expect.not.stringContaining('dist'), expect.anything())
        expect(db.knex).not.toBeUndefined()
      })

      test('Should configure a SQLite database connection using a provided filename from an env var', async () => {
        process.env.DATABASE_URL = sqlitePath

        mocked(fs.existsSync).mockReturnValueOnce(true)

        const db = new DatabaseService()
        await db.setup()

        expect(Object.keys(db['pool'])).toEqual(['log'])
        expect(db['isLite']).toEqual(true)
        expect(db['url']).toEqual(sqlitePath)
        expect(fs.existsSync).toHaveBeenCalledTimes(1)
        expect(fs.existsSync).toHaveBeenCalledWith(path.dirname(sqlitePath))
        expect(db.knex).not.toBeUndefined()
      })

      test('Should configure a SQLite database connection with custom pool options', async () => {
        process.env.DATABASE_URL = sqlitePath
        process.env.DATABASE_POOL = poolOptions
        const jsonPoolOptions = JSON.parse(poolOptions)

        const db = new DatabaseService()
        await db.setup()

        expect(Object.keys(db['pool'])).toEqual(['log', ...Object.keys(jsonPoolOptions)])
        expect(db['pool']).toEqual(expect.objectContaining(jsonPoolOptions))
        expect(db['isLite']).toEqual(true)
        expect(db['url']).toEqual(sqlitePath)
        expect(db.knex).not.toBeUndefined()
      })

      test('Should configure a SQLite database connection with no extra pool options', async () => {
        process.env.DATABASE_URL = sqlitePath
        process.env.DATABASE_POOL = '{}'

        const db = new DatabaseService()
        await db.setup()

        expect(Object.keys(db['pool'])).toEqual(['log'])
        expect(db['isLite']).toEqual(true)
        expect(db['url']).toEqual(sqlitePath)
        expect(db.knex).not.toBeUndefined()
      })

      test('Should display a warning if the custom pool options are invalid JSON', async () => {
        process.env.DATABASE_URL = sqlitePath
        process.env.DATABASE_POOL = invalidPoolOptions

        const db = new DatabaseService()
        await db.setup()

        expect(db['logger'].warn).toHaveBeenCalledTimes(1)
        expect(Object.keys(db['pool'])).toEqual(['log'])
        expect(db['isLite']).toEqual(true)
        expect(db['url']).toEqual(sqlitePath)
        expect(db.knex).not.toBeUndefined()
      })
    })

    describe('destroy', () => {
      test('Should call destroy on knex', async () => {
        const db = new DatabaseService()
        await db.setup()

        mocked(db.knex.destroy).mockReturnValueOnce(Promise.resolve())

        await db.destroy()

        expect(db.knex.destroy).toHaveBeenCalledTimes(1)
        expect(db['logger'].error).not.toHaveBeenCalled()
      })

      test('Should call the logger if an error is thrown', async () => {
        const db = new DatabaseService()
        await db.setup()

        mocked(db.knex.destroy).mockImplementationOnce(Promise.reject)

        await db.destroy()

        expect(db.knex.destroy).toHaveBeenCalledTimes(1)
        expect(db['logger'].error).toHaveBeenCalledTimes(1)
      })
    })

    describe('getJson', () => {
      test('Should return the value parsed into an object', async () => {
        const db = new DatabaseService()
        await db.setup()

        expect(db.getJson(stringObj)).toEqual(obj)
      })

      test('Should return undefined if the value provided is falsy', async () => {
        const db = new DatabaseService()
        await db.setup()

        for (const value of falsyValues) {
          expect(db.getJson(value)).toEqual(undefined)
        }
      })
    })

    describe('setJson', () => {
      test('Should return object parsed into a string', async () => {
        const db = new DatabaseService()
        await db.setup()

        expect(db.setJson(obj)).toEqual(stringObj)
      })

      test('Should return undefined if the value provided is falsy', async () => {
        const db = new DatabaseService()
        await db.setup()

        for (const value of falsyValues) {
          expect(db.setJson(value)).toEqual(undefined)
        }
      })
    })

    describe('getDate', () => {
      test('Should convert a string into a new Date', async () => {
        const db = new DatabaseService()
        await db.setup()

        expect(db.getDate(stringDate)).toEqual(date)
      })
    })

    describe('setDate', () => {
      test('Should convert a string into a new Date', async () => {
        const db = new DatabaseService()
        await db.setup()

        expect(db.setDate(date)).toEqual(stringDate)
      })

      test('Should return undefined if no date is provided', async () => {
        const db = new DatabaseService()
        await db.setup()

        expect(db.setDate(undefined)).toEqual(undefined)
      })
    })

    describe('getBool', () => {
      test('Should convert the number into a boolean', async () => {
        const db = new DatabaseService()
        await db.setup()

        expect(db.getBool(1)).toEqual(true)
        expect(db.getBool(0)).toEqual(false)
      })
    })

    describe('setBool', () => {
      test('Should return a number from a boolean', async () => {
        const db = new DatabaseService()
        await db.setup()

        expect(db.setBool(true)).toEqual(1)
        expect(db.setBool(false)).toEqual(0)
      })
    })
  })
})
