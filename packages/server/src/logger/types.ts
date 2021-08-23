import clc from 'cli-color'
import _ from 'lodash'
import moment from 'moment'
import yn from 'yn'

export enum LoggerLevel {
  Debug = 10,
  Warn = 20,
  Error = 30,
  Critical = 40,
  Info = 50
}

type Param = string | object | undefined

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

  info(message: string, data?: Param) {
    this.print([message, data], LoggerLevel.Info)
  }

  debug(message: string, data?: Param) {
    this.print([message, data], LoggerLevel.Debug)
  }

  warn(message: string, data?: Param) {
    this.print([message, data], LoggerLevel.Warn)
  }

  error(error: undefined, message: string, data?: Param): void
  error(error: Error, message?: string, data?: Param): void
  error(error: Error | undefined, message?: string, data?: Param) {
    if (message?.length && message[message.length - 1] !== '.') {
      message += '.'
    }

    this.print([message, data, error?.stack], LoggerLevel.Error)
  }

  center(text: string, width: number) {
    const indent = (yn(process.env.SPINNED) ? 37 : 25) + this.scope.length
    const padding = Math.floor((width - text.length) / 2)
    return _.repeat(' ', padding + indent) + text + _.repeat(' ', padding)
  }

  private print(params: Param[], level: LoggerLevel) {
    const timeFormat = 'L HH:mm:ss.SSS'
    const time = moment().format(timeFormat)

    const timeText = clc.blackBright(time)
    const titleText = clc.bold(this.colors[level](yn(process.env.SPINNED) ? `[Messaging] ${this.scope}` : this.scope))

    let definedParams = params.filter((x) => x !== undefined)
    if (yn(process.env.SINGLE_LINE_LOGGING)) {
      definedParams = this.singleLine(definedParams)
    }

    // eslint-disable-next-line no-console
    console.log(timeText, titleText, ...definedParams)
  }

  private singleLine(params: Param[]) {
    return params.map((x) => {
      if ((typeof x === 'string' && /\r|\n/.exec(x)) || (typeof x === 'object' && x !== null)) {
        try {
          return JSON.stringify(x)
        } catch {
          return x
        }
      }
      return x
    })
  }
}
