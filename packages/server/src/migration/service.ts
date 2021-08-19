import semver from 'semver'
import { Service } from '../base/service'
import { DatabaseService } from '../database/service'
import { Logger } from '../logger/types'
import { MetaService } from '../meta/service'
import { Migration } from './migration'
import migs from './migs'

export class MigrationService extends Service {
  private logger = new Logger('Migration')

  constructor(private db: DatabaseService, private meta: MetaService) {
    super()
  }

  async setup() {
    const appVersion = this.meta.app().version
    this.logger.debug('App Version:', appVersion)

    const dbVersion = this.meta.get().version
    this.logger.debug('Database Version', dbVersion)

    const migrations = this.listAllMigrations().filter((x) => semver.lte(x.meta.version, appVersion))
    this.logger.debug(
      'Migrations',
      migrations.map((x) => x.meta)
    )
  }

  private listAllMigrations() {
    return migs.map((x) => new x(this.db)) as Migration[]
  }
}
