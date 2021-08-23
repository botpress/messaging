import clc from 'cli-color'
import _ from 'lodash'
import semver from 'semver'
import yn from 'yn'
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
    const dbVersion = this.meta.get().version

    await this.migrateUp(dbVersion, appVersion)
  }

  private async migrateUp(srcVersion: string, dstVersion: string) {
    const migrationsToRun = this.listAllMigrations().filter(
      (x) => semver.gt(x.meta.version, srcVersion) && semver.lte(x.meta.version, dstVersion)
    )

    if (migrationsToRun.length) {
      const header = yn(process.env.MIGRATE_DRYRUN) ? 'DRY RUN' : 'Migrations Required'

      this.logger.warn(
        '========================================\n' +
          clc.bold(this.logger.center(header, 40)) +
          '\n' +
          clc.blackBright(this.logger.center(`Version ${srcVersion} => ${dstVersion}`, 40)) +
          '\n' +
          clc.blackBright(this.logger.center(`${migrationsToRun.length} changes`, 40)) +
          '\n' +
          this.logger.center('========================================', 40)
      )

      const migrationsByVersion = _.groupBy(migrationsToRun, 'meta.version')

      for (const [version, migrations] of Object.entries(migrationsByVersion)) {
        this.logger.warn(clc.bold(version))
        for (const migration of migrations) {
          this.logger.warn(`- ${migration.meta.description}`)
        }
      }

      if (yn(process.env.MIGRATE_DRYRUN)) {
        await this.runMigrations(migrationsToRun)
        process.exit(0)
      }

      if (!yn(process.env.AUTO_MIGRATE)) {
        this.logger.error(undefined, 'Migrations required. Please restart the server with AUTO_MIGRATE=true')
        process.exit(0)
      }

      await this.runMigrations(migrationsToRun)
    }

    if (!semver.eq(this.meta.get().version, dstVersion)) {
      await this.meta.update({ version: dstVersion })
    }
  }

  private async runMigrations(migrationsToRun: Migration[]) {
    const logPrefix = yn(process.env.MIGRATE_DRYRUN) ? clc.blackBright('[DRY] ') : ''
    this.logger.info(
      '========================================\n' +
        clc.bold(
          this.logger.center(
            `${logPrefix}Executing ${migrationsToRun.length} migration${migrationsToRun.length > 1 ? 's' : ''}`,
            40
          )
        ) +
        '\n' +
        this.logger.center('========================================', 40)
    )

    const migrationsByVersion = _.groupBy(migrationsToRun, 'meta.version')
    const trx = await this.db.knex.transaction()

    try {
      for (const [version, migrations] of Object.entries(migrationsByVersion)) {
        this.logger.info(`${logPrefix}${clc.bold(version)}`)

        for (const migration of migrations) {
          this.logger.info(`${logPrefix}Running`, migration.meta.name)
          migration.transact(trx)

          if (!(await migration.applied())) {
            await migration.up()
            this.logger.info(`${logPrefix}- Success`)
          } else {
            this.logger.info(`${logPrefix}- Skipped`)
          }
        }
      }

      if (yn(process.env.MIGRATE_DRYRUN)) {
        await trx.rollback()
      } else {
        await trx.commit()
      }

      this.logger.info(`${logPrefix}Migrations completed successfully!`)
    } catch (e) {
      await trx.rollback()
      throw e
    }
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
