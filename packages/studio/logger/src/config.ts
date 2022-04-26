import { ConsoleFormatter } from './formatters/console'
import { ConsoleTransport } from './transports/console'
import { LoggerConfig } from './typings'

const LOG_PREFIX = 'NLU'

export enum LoggerLevel {
  Critical = 0,
  Error = 1,
  Warn = 2,
  Info = 3,
  Debug = 4
}

export const defaultConfig: LoggerConfig = {
  level: LoggerLevel.Info,
  minLevel: undefined,
  timeFormat: 'L HH:mm:ss.SSS',
  namespaceDelimiter: ':',
  colors: {
    [LoggerLevel.Debug]: 'blue',
    [LoggerLevel.Info]: 'green',
    [LoggerLevel.Warn]: 'yellow',
    [LoggerLevel.Error]: 'red',
    [LoggerLevel.Critical]: 'red'
  },
  formatter: new ConsoleFormatter({ indent: !!process.env.INDENT_LOGS }),
  transports: [new ConsoleTransport()],
  indent: false,
  filters: undefined, // show all logs
  prefix: LOG_PREFIX
}
