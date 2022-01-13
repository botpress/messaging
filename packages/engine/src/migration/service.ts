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

export class MigrationService extends Service {
  private migs!: { new (): Migration }[]
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

  setMigrations(migs: { new (): Migration }[]) {
    this.migs = migs
  }

  async setup() {
    this.srcVersion = process.env.TESTMIG_DB_VERSION || this.meta.get()?.version || '0.0.0'
    this.dstVersion = process.env.MIGRATE_TARGET || this.meta.app().version
    this.autoMigrate = !!yn(process.env.AUTO_MIGRATE) || !!process.env.MIGRATE_CMD?.length
    this.isDown = process.env.MIGRATE_CMD === 'down'
    this.isDry = !!yn(process.env.MIGRATE_DRYRUN)
    this.loggerDry = this.logger.prefix(this.isDry ? '[DRY] ' : '')

    await this.migrate()

    if (process.env.MIGRATE_CMD) {
      throw new ShutDownSignal()
    }
  }

  private async migrate() {
    this.validateSrcAndDst()

    if (!this.meta.get() && semver.eq(this.dstVersion, this.meta.app().version) && !process.env.MIGRATE_CMD?.length) {
      // if there is no meta entry in the database, this means that the db hasn't been created yet
      // in that case we don't run any migrations at all and just let the server create the db if
      // the target version is the same version as the server and we aren't explicitly migrating
      return
    }

    const migrations = this.listMigrationsToRun()
    if (!migrations.length && !this.isDry && !process.env.MIGRATE_CMD?.length) {
      // if there's no migration to run, and we didn't explicitly specify migration commands
      // then there's no need to show all the fanfare of migration plans and we just update the db version silently
      return this.updateDbVersion()
    }

    this.showMigrationsRequiredWindow(migrations.length)
    this.showMigrationPlan(migrations)

    if (this.isDry) {
      await this.runMigrations(migrations)
      throw new ShutDownSignal()
    }

    if (!this.autoMigrate) {
      this.logger.error(undefined, 'Migrations required. Please restart the messaging server with --auto-migrate')
      throw new ShutDownSignal(1)
    }

    await this.runMigrations(migrations)
  }

  private validateSrcAndDst() {
    if (this.isDown && semver.gt(this.dstVersion, this.srcVersion)) {
      this.logger.error(
        undefined,
        `Invalid migration parameters: down migration cannot target a version (${this.dstVersion}) higher than the current server version (${this.srcVersion})`
      )
      throw new ShutDownSignal(1)
    }

    if (!this.isDown && semver.lt(this.dstVersion, this.srcVersion)) {
      this.logger.error(
        undefined,
        `Invalid migration parameters: up migration cannot target a version (${this.dstVersion}) lower than the current server version (${this.srcVersion})`
      )
      throw new ShutDownSignal(1)
    }

    if (semver.gt(this.dstVersion, this.meta.app().version)) {
      this.logger.error(
        undefined,
        `Invalid migration parameters: up migration cannot target a version (${
          this.dstVersion
        }) higher than the application version (${this.meta.app().version})`
      )
      throw new ShutDownSignal(1)
    }
  }

  private async runMigrations(migrations: Migration[]) {
    this.loggerDry.window([clc.bold(`Executing ${migrations.length} migration${migrations.length > 1 ? 's' : ''}`)])

    await this.disableSqliteForeignKeys()
    const migrationsByVersion = _.groupBy(migrations, 'meta.version')
    const trx = await this.db.knex.transaction()

    try {
      for (const [version, migrations] of Object.entries(migrationsByVersion)) {
        await this.runMigrationsForVersion(version, migrations, trx)
      }

      await this.updateDbVersion(trx)

      if (this.isDry) {
        await trx.rollback()
      } else {
        await trx.commit()
      }

      this.loggerDry.info('Migrations completed successfully!')
    } catch (e) {
      await trx.rollback()
      this.loggerDry.error(e, 'Migrations failed')
      throw new ShutDownSignal(1)
    } finally {
      await this.enableSqliteForeignKeys()
      await this.meta.refresh()
    }
  }

  private async runMigrationsForVersion(version: string, migrations: Migration[], trx: Knex.Transaction) {
    this.loggerDry.info(clc.bold(version))

    for (const migration of migrations) {
      this.loggerDry.info(`Running ${migration.meta.name}`)
      await migration.init(trx, this.loggerDry, this.isDown, this.db.getIsLite())

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
    const all = this.migs.map((x) => new x())
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

  private async updateDbVersion(trx?: Knex.Transaction) {
    await this.meta.update({ version: this.dstVersion }, trx)
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

  private async disableSqliteForeignKeys() {
    if (this.db.getIsLite()) {
      await this.db.knex.raw('PRAGMA foreign_keys = OFF;')
    }
  }

  private async enableSqliteForeignKeys() {
    if (this.db.getIsLite()) {
      await this.db.knex.raw('PRAGMA foreign_keys = ON;')
    }
  }
}
