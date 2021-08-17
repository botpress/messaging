import { uuid } from '@botpress/messaging-base'
import { v4 as uuidv4 } from 'uuid'
import { Service } from '../base/service'
import { ServerCache } from '../caching/cache'
import { CachingService } from '../caching/service'
import { DatabaseService } from '../database/service'
import { StatusTable } from './table'

export class StatusService extends Service {
  private table: StatusTable
  private cache!: ServerCache<uuid, number>

  constructor(private db: DatabaseService, private cachingService: CachingService) {
    super()
    this.table = new StatusTable()
  }

  async setup() {
    this.cache = await this.cachingService.newServerCache('cache_nb_error_by_conduit')

    await this.db.registerTable(this.table)
  }

  public async get(conduitId: uuid): Promise<number | undefined> {
    const cached = this.cache.get(conduitId)
    if (cached) {
      return cached
    }

    const rows = await this.query().where({ conduitId })
    if (rows?.length) {
      const numberOfErrors = rows[0]['numberOfErrors']

      this.cache.set(conduitId, numberOfErrors)

      return numberOfErrors
    }

    return undefined
  }

  async addError(conduitId: uuid, error: Error) {
    const numberOfErrors = await this.get(conduitId)

    if (numberOfErrors === undefined) {
      await this.query().insert({ id: uuidv4(), conduitId, numberOfErrors: 1, lastError: error })

      this.cache.set(conduitId, 1)
    } else {
      await this.query()
        .update({ numberOfErrors: numberOfErrors + 1, lastError: error })
        .where({ conduitId })

      this.cache.set(conduitId, numberOfErrors + 1)
    }
  }

  async clearErrors(conduitId: uuid) {
    const numberOfErrors = await this.get(conduitId)

    if (numberOfErrors && numberOfErrors > 0) {
      await this.query().update({ numberOfErrors: 0, lastError: null }).where({ conduitId })

      this.cache.set(conduitId, 0)
    }
  }

  private query() {
    return this.db.knex(this.table.id)
  }
}
