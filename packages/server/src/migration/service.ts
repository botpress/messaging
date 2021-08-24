import clc from 'cli-color'
import { Knex } from 'knex'
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
  private loggerDry!: Logger
  private srcVersion!: string
  private dstVersion!: string
  private autoMigrate!: boolean
  private isDown!: boolean
  private isDry!: boolean

  constructor(private db: DatabaseService, private meta: MetaService) {
    super()
  }

  async setup() {
    this.srcVersion = process.env.TESTMIG_DB_VERSION || this.meta.get().version
    this.dstVersion = process.env.MIGRATE_TARGET || this.meta.app().version
    this.autoMigrate = !!yn(process.env.AUTO_MIGRATE)
    this.isDown = process.env.MIGRATE_CMD === 'down'
    this.isDry = !!yn(process.env.MIGRATE_DRYRUN)

    await this.migrate()
    await this.updateDbVersion()

    if (process.env.MIGRATE_CMD) {
      throw new ShutDownSignal()
    }
  }

  private async migrate() {
    const migrations = this.listMigrationsToRun()
    if (!migrations.length && !this.isDry && !process.env.MIGRATE_CMD?.length) {
      return
    }

    this.showMigrationsRequiredWindow(migrations.length)
    this.showMigrationPlan(migrations)

    if (this.isDry) {
      await this.runMigrations(migrations)
      throw new ShutDownSignal()
    }

    if (!this.autoMigrate) {
      this.logger.error(undefined, 'Migrations required. Please restart the server with AUTO_MIGRATE=true')
      throw new ShutDownSignal()
    }

    await this.runMigrations(migrations)
  }

  private async runMigrations(migrations: Migration[]) {
    this.loggerDry = this.logger.prefix(this.isDry ? '[DRY] ' : '')
    this.loggerDry.window([clc.bold(`Executing ${migrations.length} migration${migrations.length > 1 ? 's' : ''}`)])

    const migrationsByVersion = _.groupBy(migrations, 'meta.version')
    const trx = await this.db.knex.transaction()

    try {
      for (const [version, migrations] of Object.entries(migrationsByVersion)) {
        await this.runMigrationsForVersion(version, migrations, trx)
      }

      if (this.isDry) {
        await trx.rollback()
      } else {
        await trx.commit()
      }

      this.loggerDry.info('Migrations completed successfully!')
    } catch (e) {
      await trx.rollback()
      this.loggerDry.error(e, 'Migrations failed')
      throw new ShutDownSignal()
    }
  }

  private async runMigrationsForVersion(version: string, migrations: Migration[], trx: Knex.Transaction) {
    this.loggerDry.info(clc.bold(version))

    for (const migration of migrations) {
      this.loggerDry.info(`Running ${migration.meta.name}`)
      await migration.init(trx, this.isDown)

      if (await migration.shouldRun()) {
        await migration.run()
        this.loggerDry.info('- Success')
      } else {
        this.loggerDry.info('- Skipped')
      }
    }
  }

  private listMigrationsToRun() {
    const allMigrations = this.listAllMigrations()

    return this.isDown
      ? allMigrations
          .filter((x) => semver.lte(x.meta.version, this.srcVersion) && semver.gt(x.meta.version, this.dstVersion))
          .reverse()
      : allMigrations.filter(
          (x) => semver.gt(x.meta.version, this.srcVersion) && semver.lte(x.meta.version, this.dstVersion)
        )
  }

  private listAllMigrations() {
    const all = migs.map((x) => new x()) as Migration[]
    const alphabetical = all.sort((a, b) => {
      return a.meta.name.localeCompare(b.meta.name, 'en')
    })
    return alphabetical.sort((a, b) => {
      if (semver.gt(a.meta.version, b.meta.version)) {
        return 1
      } else if (semver.lt(a.meta.version, b.meta.version)) {
        return -1
      } else {
        return 0
      }
    })
  }

  private async updateDbVersion() {
    if (!semver.eq(this.meta.get().version, this.dstVersion)) {
      await this.meta.update({ version: this.dstVersion })
    }
  }

  private showMigrationsRequiredWindow(migrationCount: number) {
    this.logger.window(
      [
        clc.bold(this.isDry ? 'DRY RUN' : 'Migrations Required'),
        clc.blackBright(`Version ${this.srcVersion} => ${this.dstVersion}`),
        clc.blackBright(`${migrationCount} changes`)
      ],
      LoggerLevel.Warn
    )
  }

  private showMigrationPlan(migrationsToRun: Migration[]) {
    const migrationsByVersion = _.groupBy(migrationsToRun, 'meta.version')

    for (const [version, migrations] of Object.entries(migrationsByVersion)) {
      this.logger.warn(clc.bold(version))
      for (const migration of migrations) {
        this.logger.warn(`- ${this.isDown ? '[rollback] ' : ''}${migration.meta.description}`)
      }
    }
  }
}
