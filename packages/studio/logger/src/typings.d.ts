export interface Logger {
  attachError(error: Error): this
  configure(config: Partial<LoggerConfig>): void
  debug(message: string, metadata?: any): void
  info(message: string, metadata?: any): void
  warn(message: string, metadata?: any): void
  error(message: string, metadata?: any): void
  critical(message: string, metadata?: any): void
  sub(namespace: string): Logger
}

export type LogEntryType = 'log' | 'stacktrace'

export interface LogEntry {
  type: LogEntryType
  level: number
  message: string
  namespace: string
  metadata?: any
  stack?: any
}

export type FormattedLogEntry = LogEntry & {
  formatted: string
}

export interface LogEntryFormatter {
  format(config: LoggerConfig, entry: LogEntry): FormattedLogEntry
}

export interface LogTransporter {
  send(config: LoggerConfig, entry: FormattedLogEntry): Promise<void> | void
}

export interface LoggerConfig {
  level: number
  minLevel: number | undefined // if defined, allows to bypass filters
  formatter: LogEntryFormatter
  transports: LogTransporter[]
  timeFormat: string // moment time format
  namespaceDelimiter: string
  colors: { [level: number]: string }
  indent: boolean
  filters: string[] | undefined // if undefined, all logs are displayed
  prefix?: string
}

export const centerText: (text: string, width: number, indent: number) => string
export const LoggerLevel: {
  Critical: 0
  Error: 1
  Warn: 2
  Info: 3
  Debug: 4
}
export const makeLogger: (config?: Partial<LoggerConfig>) => Logger
export const ConsoleTransport: LogTransporter
