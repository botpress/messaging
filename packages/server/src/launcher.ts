import clc from 'cli-color'
import { Express } from 'express'
import { createHttpTerminator, HttpTerminator } from 'http-terminator'
import _ from 'lodash'
import ms from 'ms'
import portfinder from 'portfinder'
import yn from 'yn'
import { Api } from './api'
import { App } from './app'
import { Logger } from './logger/types'

const pkg = require('../package.json')

export class Launcher {
  private logger: Logger
  private shuttingDown: boolean = false
  private httpTerminator: HttpTerminator | undefined
  private readonly shutdownTimeout: number = ms('5s')

  constructor(private express: Express, private app: App, private api: Api) {
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
    await this.app.config.setupEnv()
    this.printLogo()
    await this.app.setup()
    this.printChannels()

    await this.api.setup()

    let port = process.env.PORT || this.app.config.current.server?.port
    if (!port) {
      portfinder.basePort = 3100
      port = (await portfinder.getPortPromise()).toString()
    }

    const server = this.express.listen(port)
    await this.api.sockets.setup(server)
    this.httpTerminator = createHttpTerminator({ server, gracefulTerminationTimeout: this.shutdownTimeout })

    if (!yn(process.env.SPINNED)) {
      this.logger.info(`Server is listening at: http://localhost:${port}`)

      const externalUrl = process.env.EXTERNAL_URL || this.app.config.current.server?.externalUrl
      if (externalUrl?.length) {
        this.logger.info(`Server is exposed at: ${externalUrl}`)
      }
    } else {
      this.logger.info(clc.blackBright(`Messaging is listening at: http://localhost:${port}`))
    }

    await this.app.monitor()
  }

  async shutDown(code?: number) {
    if (!this.shuttingDown) {
      this.shuttingDown = true

      if (!yn(process.env.SPINNED)) {
        this.logger.info('Server gracefully closing down...')
      }

      await this.api.sockets.destroy()
      await this.httpTerminator?.terminate()
      await this.app.destroy()

      if (!yn(process.env.SPINNED)) {
        this.logger.info('Server shutdown complete')
      }
    }
    process.exit(code)
  }

  private printLogo() {
    if (yn(process.env.NO_LOGO)) {
      return
    }

    const centerText = (text: string, width: number, indent: number = 0) => {
      const padding = Math.floor((width - text.length) / 2)
      return _.repeat(' ', padding + indent) + text + _.repeat(' ', padding)
    }

    const width = yn(process.env.SPINNED) ? 45 : 33
    this.logger.info(
      '========================================\n' +
        clc.bold(centerText('Botpress Messaging', 40, width)) +
        '\n' +
        clc.blackBright(centerText(`Version ${pkg.version}`, 40, width)) +
        '\n' +
        centerText('========================================', 40, width)
    )
  }

  private printChannels() {
    if (yn(process.env.NO_LOGO)) {
      return
    }

    if (!yn(process.env.SPINNED)) {
      const padding = _.repeat(' ', 24)
      let text = ''
      let enabled = 0

      for (const channel of this.app.channels.list()) {
        enabled++
        text += `\n${padding}${clc.green('⦿')} ${channel.name}`
      }

      this.logger.info(`Using ${clc.bold(enabled)} channels` + text)
    } else {
      this.logger.info(
        `Using channels: ${this.app.channels
          .list()
          .map((x) => x.name)
          .join(', ')}`
      )
    }
  }
}
