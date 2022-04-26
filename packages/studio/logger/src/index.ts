import _ from 'lodash'
import { LoggerLevel as EnumLoggerLevel } from './config'
import { Logger } from './logger'
import { ConsoleTransport as DefaultTransport } from './transports/console'
import * as sdk from './typings'

export const centerText: typeof sdk.centerText = (text: string, width: number, indent: number = 0) => {
  const padding = Math.floor((width - text.length) / 2)
  return _.repeat(' ', padding + indent) + text + _.repeat(' ', padding)
}

export const LoggerLevel: typeof sdk.LoggerLevel = {
  Critical: EnumLoggerLevel.Critical,
  Error: EnumLoggerLevel.Error,
  Warn: EnumLoggerLevel.Warn,
  Info: EnumLoggerLevel.Info,
  Debug: EnumLoggerLevel.Debug
}

export const makeLogger: typeof sdk.makeLogger = (config: Partial<sdk.LoggerConfig> = {}) => {
  const logger = new Logger()
  logger.configure(config)
  return logger
}

export const ConsoleTransport = DefaultTransport
