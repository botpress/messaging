import _ from 'lodash'
import { DatabaseService } from '../../src/database/service'
import { ConfigService } from '../../src/config/service'

jest.mock('../../src/config/service')

describe('DatabaseService', () => {
  let configService: ConfigService

  const postgresDatabaseUrl = 'postgres://user:pass@url:123/db'

  beforeEach(async () => {
    configService = new ConfigService()
    configService['current'] = {}
  })

  test('Should instantiate without throwing any error', () => {
    try {
      new DatabaseService(configService)
    } catch (e) {
      fail(e)
    }
  })

  test('Should setup a PostgreSQL database connection', async () => {
    const env = _.cloneDeep(process.env)
    process.env.DATABASE_URL = postgresDatabaseUrl

    const db = new DatabaseService(configService)

    await db.setup()

    expect(Object.keys(db['pool'])).toEqual(['log'])
    expect(db['isLite']).toEqual(false)
    expect(db['url']).toEqual(postgresDatabaseUrl)
    expect(db.knex).not.toBeUndefined()

    process.env = env
  })

  test('Should setup a SQLite database connection', async () => {
    const db = new DatabaseService(configService)

    await db.setup()

    expect(Object.keys(db['pool'])).toEqual(['log'])
    expect(db['isLite']).toEqual(true)
    expect(db['url']).toBeUndefined()
    expect(db.knex).not.toBeUndefined()
  })
})
