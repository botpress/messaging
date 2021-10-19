import { uuid } from '@botpress/messaging-base'
import { ServerCache, CachingService, DatabaseService, DistributedService } from '@botpress/messaging-engine'
import { Service } from '../base/service'
import { ConduitEvents } from '../conduits/events'
import { ConduitService } from '../conduits/service'
import { StatusTable } from './table'

export class StatusService extends Service {
  private table: StatusTable
  private cache!: ServerCache<uuid, number>

  constructor(
    private db: DatabaseService,
    private distributed: DistributedService,
    private caching: CachingService,
    private conduits: ConduitService
  ) {
    super()
    this.table = new StatusTable()
    this.conduits.events.on(ConduitEvents.Deleting, this.onConduitDeleted.bind(this))
  }

  async setup() {
    this.cache = await this.caching.newServerCache('cache_number_of_errors_by_conduit')

    await this.db.registerTable(this.table)
  }

  public async getNumberOfErrors(conduitId: uuid): Promise<number | undefined> {
    const cached = this.cache.get(conduitId)
    if (cached) {
      return cached
    }

    const rows = await this.query().where({ conduitId })
    if (rows?.length) {
      const numberOfErrors = rows[0].numberOfErrors

      this.cache.set(conduitId, numberOfErrors)

      return numberOfErrors
    }

    return undefined
  }

  async addError(conduitId: uuid, error: Error) {
    await this.distributed.using(`lock_dyn_status::${conduitId}`, async () => {
      const numberOfErrors = await this.getNumberOfErrors(conduitId)
      const formattedError = this.formatError(error)

      if (numberOfErrors === undefined) {
        await this.query().insert({ conduitId, numberOfErrors: 1, lastError: formattedError })

        this.cache.set(conduitId, 1, undefined, true)
      } else {
        await this.query()
          .update({ numberOfErrors: numberOfErrors + 1, lastError: formattedError })
          .where({ conduitId })

        this.cache.set(conduitId, numberOfErrors + 1, undefined, true)
      }
    })
  }

  async clearErrors(conduitId: uuid) {
    await this.distributed.using(`lock_dyn_status::${conduitId}`, async () => {
      const numberOfErrors = await this.getNumberOfErrors(conduitId)

      if (numberOfErrors && numberOfErrors > 0) {
        await this.query().update({ numberOfErrors: 0, lastError: null }).where({ conduitId })

        this.cache.del(conduitId, true)
      }
    })
  }

  private query() {
    return this.db.knex(this.table.id)
  }

  private async onConduitDeleted(conduitId: string) {
    this.cache.del(conduitId, true)
  }

  private formatError(error: Error) {
    let formattedError = `${error.name}: ${error.message}`

    if (error.stack) {
      formattedError = error.stack
    }

    return formattedError
  }
}
