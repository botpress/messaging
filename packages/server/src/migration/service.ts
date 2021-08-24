import clc from 'cli-color'
import _ from 'lodash'
import semver from 'semver'
import yn from 'yn'
import { ShutDownSignal } from '../base/errors'
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
  private isDown!: boolean
  private isDry!: boolean

  constructor(private db: DatabaseService, private meta: MetaService) {
    super()
  }

  async setup() {
    this.srcVersion = process.env.TESTMIG_DB_VERSION || this.meta.get().version
    this.dstVersion = process.env.MIGRATE_TARGET || this.meta.app().version
    this.isDown = process.env.MIGRATE_CMD === 'down'
    this.isDry = !!yn(process.env.MIGRATE_DRYRUN)

    const allMigrations = this.listAllMigrations()

    const migrationsToRun = this.isDown
      ? allMigrations
          .filter((x) => semver.lte(x.meta.version, this.srcVersion) && semver.gt(x.meta.version, this.dstVersion))
          .reverse()
      : allMigrations.filter(
          (x) => semver.gt(x.meta.version, this.srcVersion) && semver.lte(x.meta.version, this.dstVersion)
        )

    await this.migrate(migrationsToRun)

    if (process.env.MIGRATE_CMD) {
      throw new ShutDownSignal()
    }
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
          this.logger.warn(`- ${this.isDown ? '[rollback] ' : ''}${migration.meta.description}`)
        }
      }

      if (this.isDry) {
        await this.runMigrations(migrationsToRun)
        throw new ShutDownSignal()
      }

      if (!yn(process.env.AUTO_MIGRATE)) {
        this.logger.error(undefined, 'Migrations required. Please restart the server with AUTO_MIGRATE=true')
        throw new ShutDownSignal()
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
          if ((await migration.applied(this.isDown)) === this.isDown) {
            if (this.isDown) {
              await migration.down()
            } else {
              await migration.up()
            }
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
      this.logger.error(e, `${logPrefix}Migrations failed`)
      throw new ShutDownSignal()
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
