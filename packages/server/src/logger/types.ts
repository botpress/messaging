import clc from 'cli-color'
import moment from 'moment'
import yn from 'yn'

export enum LoggerLevel {
  Debug = 10,
  Warn = 20,
  Error = 30,
  Critical = 40,
  Info = 50
}

export class Logger {
  private readonly colors = {
    [LoggerLevel.Debug]: clc.blue,
    [LoggerLevel.Warn]: clc.yellow,
    [LoggerLevel.Error]: clc.red,
    [LoggerLevel.Critical]: clc.bgRed,
    [LoggerLevel.Info]: clc.green
  }

  constructor(private scope: string) {}

  sub(scope: string) {
    return new Logger(`${this.scope}:${scope}`)
  }

  info(message: string, data?: any) {
    this.print([message, data], LoggerLevel.Info)
  }

  debug(message: string, data?: any) {
    this.print([message, data], LoggerLevel.Debug)
  }

  warn(message: string, data?: any) {
    this.print([message, data], LoggerLevel.Warn)
  }

  error(error: Error | undefined, message?: string, data?: any) {
    if (message?.length && message[message.length - 1] !== '.') {
      message += '.'
    }

    this.print([message, data, error?.stack], LoggerLevel.Error)
  }

  private print(params: any[], level: LoggerLevel) {
    const timeFormat = 'L HH:mm:ss.SSS'
    const time = moment().format(timeFormat)

    const timeText = clc.blackBright(time)
    const titleText = clc.bold(this.colors[level](yn(process.env.SPINNED) ? `[Messaging] ${this.scope}` : this.scope))

    // eslint-disable-next-line no-console
    console.log(timeText, titleText, ...params.filter((x) => x !== undefined))
  }
}
