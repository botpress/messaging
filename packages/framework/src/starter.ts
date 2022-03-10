import dotenv from 'dotenv'
import path from 'path'
import yargs from 'yargs'
import yn from 'yn'

export class Starter {
  private launchCallback!: () => Promise<void>

  start(launchCallback: () => Promise<void>, yargsCallback: (x: yargs.Argv) => void) {
    this.launchCallback = launchCallback
    // Set NODE_ENV to production when starting server using the binary version
    process.env.NODE_ENV = process.pkg ? 'production' : process.env.NODE_ENV

    const yargs = this.createMigArgs()
    yargsCallback(yargs)
    void yargs.argv
  }

  async launch() {
    await this.setupEnv()
    await this.launchCallback()
  }

  async setupEnv() {
    if (yn(process.env.SKIP_LOAD_ENV)) {
      return
    }

    if (process.env.NODE_ENV !== 'production') {
      dotenv.config({ path: path.resolve(process.cwd(), 'dist', '.env') })
    } else {
      dotenv.config()
    }
  }

  createMigArgs() {
    return yargs
      .scriptName('')
      .command(
        ['$0', 'serve'],
        'Start server',
        (yargs) => {
          return yargs.options({ autoMigrate: { type: 'boolean', default: false } })
        },
        async (argv) => {
          if (argv.autoMigrate) {
            process.env.AUTO_MIGRATE = 'true'
          }

          await this.launch()
        }
      )
      .command('migrate', 'Migrate database', (yargs) => {
        const start = async (cmd: string, target: string, dry: boolean) => {
          process.env.AUTO_MIGRATE = 'true'
          if (cmd) {
            process.env.MIGRATE_CMD = cmd
          }
          if (target) {
            process.env.MIGRATE_TARGET = target
          }
          if (dry) {
            process.env.MIGRATE_DRYRUN = 'true'
          }
          await this.launch()
        }

        return yargs
          .command('up', 'Migrate to the latest version (unless --target is specified)', {}, async (argv) => {
            await start('up', argv.target as string, argv.dry as boolean)
          })
          .command('down', 'Downgrade to a previous version (--target must be specified)', {}, async (argv) => {
            await start('down', argv.target as string, argv.dry as boolean)
          })
          .option('target', {
            alias: 't',
            describe: 'Target a specific version'
          })
          .option('dryrun', {
            alias: 'dry',
            describe: 'Displays the list of migrations that will be executed, without applying the changes'
          })
      })
  }
}
