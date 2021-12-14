import { uuid } from '@botpress/messaging-base'
import { CachingService, DatabaseService, DistributedService, ServerCache, Service } from '@botpress/messaging-engine'
import { ConduitEvents } from '../conduits/events'
import { ConduitService } from '../conduits/service'
import { StatusTable } from './table'
import { ConduitStatus } from './types'

export class StatusService extends Service {
  private table: StatusTable
  private cache!: ServerCache<uuid, ConduitStatus>

  constructor(
    private db: DatabaseService,
    private distributed: DistributedService,
    private caching: CachingService,
    private conduits: ConduitService
  ) {
    super()
    this.table = new StatusTable()
  }

  async setup() {
    this.cache = await this.caching.newServerCache('cache_status')

    await this.db.registerTable(this.table)

    this.conduits.events.on(ConduitEvents.Deleting, this.onConduitDeleted.bind(this))
  }

  private async onConduitDeleted(conduitId: string) {
    this.cache.del(conduitId, true)
  }

  async create(conduitId: uuid): Promise<ConduitStatus> {
    const status: ConduitStatus = {
      conduitId,
      numberOfErrors: 0,
      initializedOn: undefined,
      lastError: undefined
    }

    await this.query().insert(this.serialize(status))
    this.cache.set(conduitId, status)

    return status
  }

  async fetch(conduitId: uuid): Promise<ConduitStatus | undefined> {
    const cached = this.cache.get(conduitId)
    if (cached) {
      return cached
    }

    const rows = await this.query().where({ conduitId })
    if (rows?.length) {
      const status = this.deserialize(rows[0])
      this.cache.set(conduitId, status)
      return status
    }

    return undefined
  }

  async updateInitializedOn(conduitId: uuid, date: Date | undefined) {
    await this.distributed.using(`lock_dyn_status::${conduitId}`, async () => {
      if (!(await this.fetch(conduitId))) {
        await this.create(conduitId)
      }

      await this.query()
        .update({ initializedOn: date ? this.db.setDate(date) : null })
        .where({ conduitId })
      this.cache.del(conduitId, true)
    })
  }

  async addError(conduitId: uuid, error: Error) {
    await this.distributed.using(`lock_dyn_status::${conduitId}`, async () => {
      const status = (await this.fetch(conduitId)) || (await this.create(conduitId))
      const formattedError = this.formatError(error)

      await this.query()
        .update({ numberOfErrors: status.numberOfErrors + 1, lastError: formattedError })
        .where({ conduitId })
      this.cache.del(conduitId, true)
    })
  }

  async clearErrors(conduitId: uuid) {
    await this.distributed.using(`lock_dyn_status::${conduitId}`, async () => {
      const status = await this.fetch(conduitId)
      if (!status) {
        return
      }

      await this.query().update({ numberOfErrors: 0, lastError: null }).where({ conduitId })
      this.cache.del(conduitId, true)
    })
  }

  async listOutdated(tolerance: number, maxAllowedFailures: number, limit: number): Promise<ConduitStatus[]> {
    return (
      (
        await this.query()
          // we exclude lastError because it migth make the query slow
          .select('conduitId', 'numberOfErrors', 'initializedOn')
          .where('numberOfErrors', '<', maxAllowedFailures)
          .andWhere((q) =>
            q
              .where('initializedOn', '<', this.db.setDate(new Date(Date.now() - tolerance))!)
              .orWhereNull('initializedOn')
          )
          .limit(limit)
      ).map((x) => this.deserialize(x))
    )
  }

  private formatError(error: Error) {
    let formattedError = `${error.name}: ${error.message}`

    if (error.stack) {
      formattedError = error.stack
    }

    return formattedError
  }

  private serialize(status: Partial<ConduitStatus>) {
    return {
      ...status,
      initializedOn: this.db.setDate(status.initializedOn)
    }
  }

  private deserialize(status: any): ConduitStatus {
    return {
      ...status,
      initializedOn: status.initializedOn ? this.db.getDate(status.initializedOn) : undefined,
      lastError: status.lastError || undefined
    }
  }

  private query() {
    return this.db.knex(this.table.id)
  }
}
