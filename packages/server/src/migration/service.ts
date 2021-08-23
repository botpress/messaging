import clc from 'cli-color'
import _ from 'lodash'
import semver from 'semver'
import yn from 'yn'
import { Service } from '../base/service'
import { DatabaseService } from '../database/service'
import { Logger, LoggerLevel } from '../logger/types'
import { MetaService } from '../meta/service'
import { Migration } from './migration'
import migs from './migs'

export class MigrationService extends Service {
  private logger = new Logger('Migration')
  private srcVersion!: string
  private dstVersion!: string
  private isDry!: boolean

  constructor(private db: DatabaseService, private meta: MetaService) {
    super()
  }

  async setup() {
    this.srcVersion = process.env.MIGRATE_TARGET || this.meta.app().version
    this.dstVersion = process.env.TESTMIG_DB_VERSION || this.meta.get().version
    this.isDry = !!yn(process.env.MIGRATE_DRYRUN)

    const migrationsToRun = this.listAllMigrations().filter(
      (x) => semver.gt(x.meta.version, this.srcVersion) && semver.lte(x.meta.version, this.dstVersion)
    )

    await this.migrate(migrationsToRun)
  }

  private async migrate(migrationsToRun: Migration[]) {
    if (migrationsToRun.length || this.isDry) {
      this.logger.window(
        [
          clc.bold(this.isDry ? 'DRY RUN' : 'Migrations Required'),
          clc.blackBright(`Version ${this.srcVersion} => ${this.dstVersion}`),
          clc.blackBright(`${migrationsToRun.length} changes`)
        ],
        LoggerLevel.Warn
      )

      const migrationsByVersion = _.groupBy(migrationsToRun, 'meta.version')

      for (const [version, migrations] of Object.entries(migrationsByVersion)) {
        this.logger.warn(clc.bold(version))
        for (const migration of migrations) {
          this.logger.warn(`- ${migration.meta.description}`)
        }
      }

      if (this.isDry) {
        await this.runMigrations(migrationsToRun)
        process.exit(0)
      }

      if (!yn(process.env.AUTO_MIGRATE)) {
        this.logger.error(undefined, 'Migrations required. Please restart the server with AUTO_MIGRATE=true')
        process.exit(0)
      }

      await this.runMigrations(migrationsToRun)
    }

    if (!this.isDry && !semver.eq(this.meta.get().version, this.dstVersion)) {
      await this.meta.update({ version: this.dstVersion })
    }
  }

  private async runMigrations(migrationsToRun: Migration[]) {
    const logPrefix = this.isDry ? clc.blackBright('[DRY] ') : ''
    this.logger.window([
      clc.bold(`${logPrefix}Executing ${migrationsToRun.length} migration${migrationsToRun.length > 1 ? 's' : ''}`)
    ])

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

      if (this.isDry) {
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
