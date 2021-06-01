import clc from 'cli-color'
import { Express } from 'express'
import _ from 'lodash'
import portfinder from 'portfinder'
import { Api } from './api'
import { App } from './app'
import { Logger } from './logger/types'

export class Launcher {
  private logger: Logger

  constructor(private express: Express, private port: string | undefined, private app: App, private api: Api) {
    this.logger = new Logger('Launcher')

    process.on('uncaughtException', (err) => {
      this.logger.error('Uncaught Exception', err)
      process.exit(1)
    })

    process.on('unhandledRejection', (err) => {
      this.logger.error('Unhandled Rejection', err)
      process.exit(1)
    })

    process.on('SIGINT', async () => {
      await this.shutDown()
      process.exit()
    })
  }

  async launch() {
    this.printLogo()
    await this.app.setup()
    this.printChannels()

    await this.api.setup()

    if (!this.port) {
      portfinder.basePort = 3100
      this.port = (await portfinder.getPortPromise()).toString()
    }
    this.express.listen(this.port)

    this.logger.info(`Server is listening at: http://localhost:${this.port}`)
    this.logger.info(`Server is exposed at: ${this.app.config.current.externalUrl}`)
  }

  async shutDown() {
    await this.app.destroy()
    // eslint-disable-next-line no-console
    console.log()
    this.logger.info('Shut down')
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
        clc.blackBright(centerText('Version 0.0.1', 40, 33)) +
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
