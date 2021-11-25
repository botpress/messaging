import { uuid } from '@botpress/messaging-base'
import {
  Barrier2D,
  BarrierService,
  CachingService,
  DatabaseService,
  ServerCache,
  ServerCache2D,
  Service
} from '@botpress/messaging-engine'
import { v4 as uuidv4 } from 'uuid'
import { IdentityTable } from './table'
import { Identity } from './types'

export class IdentityService extends Service {
  private table: IdentityTable
  private cacheById!: ServerCache<uuid, Identity>
  private cacheByName!: ServerCache2D<Identity>
  private barrier!: Barrier2D<Identity>

  constructor(private db: DatabaseService, private caching: CachingService, private barriers: BarrierService) {
    super()
    this.table = new IdentityTable()
  }

  async setup() {
    this.cacheById = await this.caching.newServerCache('cache_identity_by_id')
    this.cacheByName = await this.caching.newServerCache2D('cache_identity_by_name')
    this.barrier = await this.barriers.newBarrier2D('barrier_identity')

    await this.db.registerTable(this.table)
  }

  async get(id: uuid): Promise<Identity | undefined> {
    const cached = this.cacheById.get(id)
    if (cached) {
      return cached
    }

    const rows = await this.query().where({ id })

    if (rows?.length) {
      const identity = rows[0] as Identity
      this.cacheById.set(id, identity)
      return identity
    } else {
      return undefined
    }
  }

  async map(tunnelId: uuid, name: string): Promise<Identity> {
    const identity = await this.getByName(tunnelId, name)
    if (identity) {
      return identity
    }

    return this.barrier.once(tunnelId, name, async () => {
      return this.create(tunnelId, name)
    })
  }

  private async getByName(tunnelId: uuid, name: string): Promise<Identity | undefined> {
    const cached = this.cacheByName.get(tunnelId, name)
    if (cached) {
      return cached
    }

    const rows = await this.query().where({ tunnelId, name })

    if (rows?.length) {
      const identity = rows[0] as Identity
      this.cacheByName.set(tunnelId, name, identity)
      return identity
    } else {
      return undefined
    }
  }

  private async create(tunnelId: uuid, name: string): Promise<Identity> {
    const identity = {
      id: uuidv4(),
      tunnelId,
      name
    }

    await this.query().insert(identity)
    this.cacheByName.set(tunnelId, name, identity)
    this.cacheById.set(identity.id, identity)

    return identity
  }

  private query() {
    return this.db.knex(this.table.id)
  }
}
