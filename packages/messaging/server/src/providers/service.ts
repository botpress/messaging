import { uuid } from '@botpress/messaging-base'
import { CachingService, DatabaseService, ServerCache, Service } from '@botpress/messaging-engine'
import { v4 as uuidv4 } from 'uuid'
import { ProviderEmitter, ProviderEvents, ProviderWatcher } from './events'
import { ProviderTable } from './table'
import { Provider } from './types'

export class ProviderService extends Service {
  get events(): ProviderWatcher {
    return this.emitter
  }

  private emitter: ProviderEmitter
  private table: ProviderTable
  private cacheById!: ServerCache<uuid, Provider>
  private cacheByName!: ServerCache<string, Provider>

  constructor(private db: DatabaseService, private cachingService: CachingService) {
    super()
    this.emitter = new ProviderEmitter()
    this.table = new ProviderTable()
  }

  async setup() {
    this.cacheById = await this.cachingService.newServerCache('cache_provider_by_id')
    this.cacheByName = await this.cachingService.newServerCache('cache_provider_by_name')

    await this.db.registerTable(this.table)
  }

  async create(name: string, sandbox: boolean): Promise<Provider> {
    const provider = {
      id: uuidv4(),
      name,
      sandbox: sandbox === undefined ? false : sandbox
    }

    await this.query().insert(this.serialize(provider))

    return provider
  }

  async fetchByName(name: string): Promise<Provider | undefined> {
    const cached = this.cacheByName.get(name)
    if (cached) {
      return cached
    }

    const rows = await this.query().where({ name })
    if (rows?.length) {
      const provider = this.deserialize(rows[0])

      this.cacheById.set(provider.id, provider)
      this.cacheByName.set(provider.name, provider)

      return provider
    }

    return undefined
  }

  async getByName(name: string): Promise<Provider> {
    const val = await this.fetchByName(name)
    if (!val) {
      throw new Error(`Provider with name ${name} not found`)
    }
    return val
  }

  async fetchById(id: uuid): Promise<Provider | undefined> {
    const cached = this.cacheById.get(id)
    if (cached) {
      return cached
    }

    const rows = await this.query().where({ id })
    if (rows?.length) {
      const provider = this.deserialize(rows[0])

      this.cacheById.set(id, provider)
      this.cacheByName.set(provider.name, provider)

      return provider
    }

    return undefined
  }

  async getById(id: string): Promise<Provider> {
    const val = await this.fetchById(id)
    if (!val) {
      throw new Error(`Provider ${id} not found`)
    }
    return val
  }

  async updateSandbox(id: uuid, sandbox: boolean) {
    const oldProvider = await this.getById(id)

    this.cacheById.del(id, true)
    this.cacheByName.del(oldProvider.name, true)

    await this.query()
      .where({ id })
      .update({ sandbox: this.db.setBool(sandbox) })
    await this.emitter.emit(ProviderEvents.Updated, { providerId: id, oldProvider })
  }

  async updateName(id: uuid, name: string) {
    const oldProvider = await this.getById(id)

    this.cacheById.del(id, true)
    this.cacheByName.del(oldProvider.name, true)

    await this.query().where({ id }).update({ name })
    await this.emitter.emit(ProviderEvents.Updated, { providerId: id, oldProvider })
  }

  async delete(id: uuid) {
    await this.emitter.emit(ProviderEvents.Deleting, { providerId: id })

    const provider = await this.getById(id)
    this.cacheById.del(id, true)
    this.cacheByName.del(provider.name, true)

    await this.query().where({ id }).del()
  }

  private query() {
    return this.db.knex(this.table.id)
  }

  private serialize(provider: Provider) {
    return {
      ...provider,
      sandbox: this.db.setBool(provider.sandbox)
    }
  }

  private deserialize(provider: any): Provider {
    return {
      ...provider,
      sandbox: this.db.getBool(provider.sandbox)
    }
  }
}
