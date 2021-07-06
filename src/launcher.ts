import clc from 'cli-color'
import { Express } from 'express'
import _ from 'lodash'
import portfinder from 'portfinder'
import { Api } from './api'
import { App } from './app'
import { Logger } from './logger/types'

export class Launcher {
  private logger: Logger
  private shuttingDown: boolean = false

  constructor(private express: Express, private app: App, private api: Api) {
    this.logger = new Logger('Launcher')

    process.on('uncaughtException', async (err) => {
      this.logger.error('Uncaught Exception', err)
      await this.shutDown(1)
    })

    process.on('unhandledRejection', async (err) => {
      this.logger.error('Unhandled Rejection', err)
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
    this.printLogo()
    await this.app.setup()
    this.printChannels()

    await this.api.setup()

    let port = process.env.PORT || this.app.config.current.server?.port
    if (!port) {
      portfinder.basePort = 3100
      port = (await portfinder.getPortPromise()).toString()
    }

    this.express.listen(port)

    this.logger.info(`Server is listening at: http://localhost:${port}`)

    const externalUrl = process.env.EXTERNAL_URL || this.app.config.current.server?.externalUrl
    if (externalUrl?.length) {
      this.logger.info(`Server is exposed at: ${externalUrl}`)
    }
  }

  async shutDown(code?: number) {
    if (!this.shuttingDown) {
      this.shuttingDown = true
      await this.app.destroy()
    }
    process.exit(code)
  }

  private printLogo() {
    const centerText = (text: string, width: number, indent: number = 0) => {
      const padding = Math.floor((width - text.length) / 2)
      return _.repeat(' ', padding + indent) + text + _.repeat(' ', padding)
    }

    this.logger.info(
      '========================================\n' +
        clc.bold(centerText('Botpress Messaging', 40, 33)) +
        '\n' +
        clc.blackBright(centerText('Version 0.0.7', 40, 33)) +
        '\n' +
        centerText('========================================', 40, 33)
    )
  }

  private printChannels() {
    const padding = _.repeat(' ', 24)

    let enabledText = ''
    const disabledText = ''
    let enabled = 0
    for (const channel of this.app.channels.list()) {
      // TODO: should it be possible to disable channels globally?
      if (true) {
        enabled++
        enabledText += `\n${padding}${clc.green('⦿')} ${channel.name}`
      } else {
        // disabledText += `\n${padding}${clc.blackBright('⊝')} ${channel.id} ${clc.blackBright('(disabled)')}`
      }
    }

    this.logger.info(`Using ${clc.bold(enabled)} channels` + enabledText + disabledText)
  }
}
