import { Logger, ShutDownSignal } from '@botpress/messaging-engine'
import clc from 'cli-color'
import { Express } from 'express'
import { createHttpTerminator, HttpTerminator } from 'http-terminator'
import _ from 'lodash'
import moment from 'moment'
import ms from 'ms'
import portfinder from 'portfinder'
import yn from 'yn'
import { Api } from './api'
import { App } from './app'
import { Socket } from './socket'
import { Stream } from './stream'

const pkg = require('../package.json')

export class Launcher {
  private logger: Logger
  private shuttingDown: boolean = false
  private httpTerminator: HttpTerminator | undefined
  private readonly shutdownTimeout: number = ms('5s')

  constructor(
    private express: Express,
    private app: App,
    private api: Api,
    private stream: Stream,
    private socket: Socket
  ) {
    this.logger = new Logger('Launcher')

    process.on('uncaughtException', async (e) => {
      this.logger.error(e, 'Uncaught Exception')
      await this.shutDown(1)
    })

    process.on('unhandledRejection', async (e) => {
      this.logger.error(e as Error, 'Unhandled Rejection')
      await this.shutDown(1)
    })

    process.on('SIGINT', async () => {
      await this.shutDown()
    })

    process.on('SIGHUP', async () => {
      await this.shutDown()
    })

    process.on('SIGUSR2', async () => {
      await this.shutDown()
    })

    process.on('SIGTERM', async () => {
      await this.shutDown()
    })
  }

  async launch() {
    try {
      this.printLogo()
      await this.app.setup()
      await this.app.postSetup()
      this.printChannels()

      await this.api.setup()
      await this.stream.setup()
      await this.socket.setup()

      let port = process.env.PORT
      if (!port) {
        portfinder.basePort = 3100
        port = (await portfinder.getPortPromise()).toString()
      }

      const server = this.express.listen(port)
      await this.socket.manager.setup(server)
      this.httpTerminator = createHttpTerminator({ server, gracefulTerminationTimeout: this.shutdownTimeout })

      if (!yn(process.env.SPINNED)) {
        this.logger.info(`Server is listening at: http://localhost:${port}`)

        const externalUrl = process.env.EXTERNAL_URL
        if (externalUrl?.length) {
          this.logger.info(`Server is exposed at: ${externalUrl}`)
        } else {
          this.logger.warn(
            "No external URL configured. Messaging Server might not behave as expected. Set the value for 'EXTERNAL_URL' to suppress this warning"
          )
        }
      } else {
        this.logger.info(clc.blackBright(`Messaging is listening at: http://localhost:${port}`))
      }

      await this.app.monitor()
    } catch (e) {
      if (e instanceof ShutDownSignal) {
        await this.shutDown(e.code)
      } else {
        this.logger.error(e, 'Error occurred starting server')
        await this.shutDown(1)
      }
    }
  }

  async shutDown(code?: number) {
    if (yn(process.env.SPINNED)) {
      process.exit(code)
    } else if (!this.shuttingDown) {
      this.shuttingDown = true

      try {
        this.logger.info('Server gracefully closing down...')

        await this.stream.destroy()
        await this.socket.manager.destroy()
        await this.httpTerminator?.terminate()
        await this.app.destroy()

        this.logger.info('Server shutdown complete')
      } catch (e) {
        this.logger.error(e, 'Server failed to shutdown gracefully')
      } finally {
        process.exit(code)
      }
    }
  }

  private printLogo() {
    if (yn(process.env.NO_LOGO)) {
      return
    }

    let info = `Version ${pkg.version}`
    try {
      const metadata: { branch: string; date: string } = require('./metadata.json')
      const builtFrom = process.pkg ? 'BIN' : 'SRC'
      const branchInfo = metadata.branch !== 'master' ? `/${metadata.branch}` : ''

      info += ` - Build ${moment(metadata.date).format('YYYYMMDD-HHmm')}_${builtFrom}${branchInfo}`
    } catch {}

    this.logger.window([clc.bold('Botpress Messaging'), clc.blackBright(info)], undefined, 75)
  }

  private printChannels() {
    if (yn(process.env.NO_LOGO)) {
      return
    }

    if (!yn(process.env.SPINNED)) {
      const padding = yn(process.env.DISABLE_LOGGING_TIMESTAMP) ? '' : _.repeat(' ', 24)
      let text = ''
      let enabled = 0

      for (const channel of this.app.channels.list()) {
        enabled++
        text += `\n${padding}${clc.green('⦿')} ${channel.meta.name}@${channel.meta.version}`
      }

      this.logger.info(`Using ${clc.bold(enabled)} channels` + text)
    } else {
      this.logger.info(
        `Using channels: ${this.app.channels
          .list()
          .map((x) => `${x.meta.name}@${x.meta.version}`)
          .join(', ')}`
      )
    }
  }
}
