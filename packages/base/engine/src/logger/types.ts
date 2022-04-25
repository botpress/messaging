import clc from 'cli-color'
import _ from 'lodash'
import moment from 'moment'
import yn from 'yn'
import { RedisSubservice } from '../distributed/redis/subservice'

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

  constructor(private scope: string, private logPrefix?: string) {}

  sub(scope: string) {
    return new Logger(`${this.scope}:${scope}`)
  }

  prefix(prefix: string) {
    return new Logger(this.scope, prefix)
  }

  info(message: string, data?: Param) {
    this.printPrefix([message, data], LoggerLevel.Info)
  }

  debug(message: string, data?: Param) {
    this.printPrefix([message, data], LoggerLevel.Debug)
  }

  warn(message: string, data?: Param) {
    this.printPrefix([message, data], LoggerLevel.Warn)
  }

  critical(message: string, data?: Param) {
    this.printPrefix([message, data], LoggerLevel.Critical)
  }

  window(lines: string[], level = LoggerLevel.Info, width = 40) {
    const line = '='.repeat(width)
    this.print(
      [
        line +
          '\n' +
          lines
            .map((x) => this.center(this.logPrefix ? `${clc.blackBright(this.logPrefix)}${x}` : x, line.length))
            .join('\n') +
          '\n' +
          this.center(line, line.length)
      ],
      level
    )
  }

  error(error: Error | undefined | unknown, message?: string, data?: Param) {
    if (message?.length && message[message.length - 1] !== '.') {
      message += '.'
    }

    this.printPrefix([message, data, error instanceof Error ? error.stack : undefined], LoggerLevel.Error)
  }

  private center(text: string, width: number) {
    const indent =
      (yn(process.env.SPINNED) ? 12 : 0) +
      (!yn(process.env.SPINNED) && yn(process.env.CLUSTER_ENABLED) ? `[${RedisSubservice.nodeId}] `.length : 0) +
      (yn(process.env.DISABLE_LOGGING_TIMESTAMP) ? 0 : 24) +
      1 +
      this.scope.length
    const padding = Math.floor((width - clc.strip(text).length) / 2)
    return _.repeat(' ', padding + indent) + text + _.repeat(' ', padding)
  }

  private printPrefix(params: Param[], level: LoggerLevel) {
    if (this.logPrefix) {
      params[0] = `${clc.blackBright(this.logPrefix)}${params[0]}`
    }
    this.print(params, level)
  }

  private print(params: Param[], level: LoggerLevel) {
    let timeText = undefined
    if (!yn(process.env.DISABLE_LOGGING_TIMESTAMP)) {
      const timeFormat = 'L HH:mm:ss.SSS'
      const time = moment().format(timeFormat)
      timeText = clc.blackBright(time)
    }

    let title = this.scope
    if (yn(process.env.SPINNED)) {
      title = `[Messaging] ${title}`
    } else if (yn(process.env.CLUSTER_ENABLED)) {
      title = `[${RedisSubservice.nodeId}] ${title}`
    }

    const titleText = clc.bold(this.colors[level](title))
    params.unshift(titleText)
    params.unshift(timeText)

    let definedParams = params.filter((x) => x !== undefined)
    if (yn(process.env.SINGLE_LINE_LOGGING)) {
      definedParams = this.singleLine(definedParams)
    }

    if (!yn(process.env.SUPPRESS_LOGGING)) {
      // eslint-disable-next-line no-console
      console.log(...definedParams)
    }
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
