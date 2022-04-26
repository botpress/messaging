import chalk from 'chalk'
import _ from 'lodash'
import moment from 'moment'
import os from 'os'
import util from 'util'
import { LoggerLevel } from '../config'
import { FormattedLogEntry, LogEntry, LogEntryFormatter, LoggerConfig } from '../typings'

interface ConsoleFormatterOpts {
  indent: boolean
}

function _serializeArgs(args: any): string {
  if (_.isArray(args)) {
    return args.map((arg) => _serializeArgs(arg)).join(', ')
  } else if (_.isObject(args)) {
    return util.inspect(args, false, 2, true)
  } else if (_.isString(args)) {
    return args.trim()
  } else if (args && args.toString) {
    return args.toString()
  } else {
    return ''
  }
}

export class ConsoleFormatter implements LogEntryFormatter {
  constructor(private _opts: ConsoleFormatterOpts = { indent: false }) {}

  format(config: LoggerConfig, entry: LogEntry): FormattedLogEntry {
    const time = moment().format(config.timeFormat)
    const serializedMetadata = entry.metadata ? _serializeArgs(entry.metadata) : ''

    const prefix = config.prefix ? `[${config.prefix}] ` : ''
    const displayName = this._opts.indent
      ? entry.namespace.substr(0, 15).padEnd(15, ' ')
      : `${prefix}${entry.namespace}`
    // eslint-disable-next-line prefer-template
    const newLineIndent = chalk.dim(' '.repeat(`${config.timeFormat} ${displayName}`.length)) + ' '
    let indentedMessage =
      entry.level === LoggerLevel.Error ? entry.message : entry.message.replace(/\r\n|\n/g, os.EOL + newLineIndent)

    if (entry.type === 'stacktrace' && entry.stack) {
      indentedMessage += chalk.grey(os.EOL + 'STACK TRACE')
      indentedMessage += chalk.grey(os.EOL + entry.stack)
    }

    return {
      ...entry,
      formatted: chalk`{grey ${time}} {${
        config.colors[entry.level]
      }.bold ${displayName}} ${indentedMessage}${serializedMetadata}`
    }
  }
}
