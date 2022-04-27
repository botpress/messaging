import { makeLogger, ConsoleTransport, FormattedLogEntry, LoggerConfig, LogTransporter } from '@botpress/logger'
import { Logger, LogLevel } from '@botpress/sdk'
import clc from 'cli-color'
import fs from 'fs'
import { Botpress } from './botpress'
import { showBanner } from './misc/banner'
import { GlobalEvents, StudioEvents } from './studio/events'

export class StudioUITransport implements LogTransporter {
  private callback: any

  send(config: LoggerConfig, entry: FormattedLogEntry) {
    if (config.minLevel && entry.level <= config.minLevel) {
      this._log(entry.formatted)
      return
    }

    if (entry.level <= config.level) {
      if (!config.filters) {
        this._log(entry.formatted)
        return
      }
    }
  }

  setCallback(callback: any) {
    this.callback = callback
  }

  private _log(msg: string) {
    // eslint-disable-next-line no-console
    this.callback && this.callback(msg)
  }
}

async function setupDebugLogger(logger: Logger) {
  ;(global as any).printBotLog = (botId: string, args: any[]) => {
    const message = args[0]
    const rest = args.slice(1)

    logger.level(LogLevel.DEBUG).persist(false).forBot(botId).debug(message.trim(), rest)
  }
  ;(global as any).printLog = (args: any[]) => {
    const message = args[0]
    const rest = args.slice(1)

    logger.level(LogLevel.DEBUG).persist(false).debug(message.trim(), rest)
  }
}

async function start() {
  const stream = new StudioUITransport()
  const logger = makeLogger({
    prefix: 'Studio',
    transports: [new (ConsoleTransport as any)(), stream]
  }) as never as Logger
  await setupDebugLogger(logger)

  showBanner({ title: 'Botpress Studio', version: process.STUDIO_VERSION, logScopeLength: 9, bannerWidth: 75, logger })

  stream.setCallback((message: string) => {
    GlobalEvents.fireEvent(StudioEvents.CONSOLE_LOGS, { message, level: 'info', args: {} })
  })

  const studio = new Botpress(logger)

  if (!fs.existsSync(process.APP_DATA_PATH)) {
    try {
      fs.mkdirSync(process.APP_DATA_PATH)
    } catch (err) {
      logger.attachError(err).error(
        `Could not find/create APP_DATA folder "${process.APP_DATA_PATH}".
Please make sure that Botpress has the right to access this folder or change the folder path by providing the 'APP_DATA_PATH' env variable.
This is a fatal error, process will exit.`
      )

      if (!process.IS_FAILSAFE) {
        process.exit(1)
      }
    }
  }

  try {
    await studio.start()
    // await runtime.start()
    logger.info(clc.blackBright(`Studio is listening at: ${process.LOCAL_URL}`))
  } catch (err: any) {
    logger.error(`Could not start Botpress: ${err.message}`, err)
    process.exit(1)
  }
}

start().catch(printErrorDefault)
