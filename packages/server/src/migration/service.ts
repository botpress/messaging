import _ from 'lodash'
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
    this.logger.info('App Version:', appVersion)

    const dbVersion = this.meta.get().version
    this.logger.info('Database Version', dbVersion)

    const migrationsToRun = this.listAllMigrations().filter(
      (x) => semver.gt(x.meta.version, dbVersion) && semver.lte(x.meta.version, appVersion)
    )
    const migrationsByVersion = _.groupBy(migrationsToRun, 'meta.version')

    for (const [version, migrations] of Object.entries(migrationsByVersion)) {
      await this.migrateVersion(version, migrations)

      // We wait a bit between each version so the timestamp isn't too close
      await new Promise((resolve) => setTimeout(resolve, 100))
    }
  }

  private async migrateVersion(version: string, migrations: Migration[]) {
    this.logger.info(`===== Migrating to ${version} =====`)
    const trx = await this.db.knex.transaction()

    try {
      for (const migration of migrations) {
        migration.transact(trx)

        if (!(await migration.applied())) {
          this.logger.info('Running', migration.meta.name)
          await migration.up()
        } else {
          // We should expect migrations to never be skipped. This is just extra safety
          this.logger.warn('Skipped', migration.meta.name)
        }
      }
      await trx.commit()
    } catch (e) {
      await trx.rollback()
      throw e
    }

    await this.meta.update({ version })
  }

  private listAllMigrations() {
    const all = migs.map((x) => new x()) as Migration[]
    const alphabetical = all.sort((a, b) => {
      return a.meta.name.localeCompare(b.meta.name, 'en')
    })
    const versions = alphabetical.sort((a, b) => {
      if (semver.gt(a.meta.version, b.meta.version)) {
        return 1
      } else if (semver.lt(a.meta.version, b.meta.version)) {
        return -1
      } else {
        return 0
      }
    })

    return versions
  }
}
