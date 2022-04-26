import { defaultConfig, LoggerLevel } from './config'
import * as sdk from './typings'

export class Logger implements sdk.Logger {
  public static default = new Logger()
  private static _GLOBAL_NAMESPACE = 'global'
  private _loggers = new Map<string, Logger>()
  private _config: sdk.LoggerConfig = defaultConfig
  public parent: Logger | null = null
  public namespace: string = ''

  constructor(private _name: string = Logger._GLOBAL_NAMESPACE) {}

  configure(config: Partial<sdk.LoggerConfig>) {
    this._config = { ...this._config, ...config }

    // logger configures all childs
    for (const logger of this._loggers.values()) {
      logger.configure(config)
    }
  }

  public sub(name: string): Logger {
    if (this._loggers.has(name)) {
      return this._loggers.get(name)!
    }
    const logger = new Logger(name)

    if (name === Logger._GLOBAL_NAMESPACE) {
      logger.parent = null
      logger.namespace = ''
    } else {
      logger.parent = this
      logger._config = { ...this._config } // copy parent config
      logger.namespace = logger.parent.namespace.length ? logger.parent.namespace + this._config.namespaceDelimiter : ''
      logger.namespace += name
    }

    this._loggers.set(name, logger)
    return logger
  }

  attachError(error: Error): this {
    this.push({ type: 'stacktrace', level: LoggerLevel.Critical, message: error.message, stack: error.stack })
    return this
  }

  private push(entry: Omit<sdk.LogEntry, 'namespace'>) {
    const formattedEntry = this._config.formatter.format(this._config, { ...entry, namespace: this.namespace })
    this._config.transports.forEach((transport) => transport.send(this._config, formattedEntry))
  }

  critical(message: string, metadata?: any): void {
    this.push({ type: 'log', level: LoggerLevel.Critical, message, metadata })
  }

  debug(message: string, metadata?: any): void {
    this.push({ type: 'log', level: LoggerLevel.Debug, message, metadata })
  }

  info(message: string, metadata?: any): void {
    this.push({ type: 'log', level: LoggerLevel.Info, message, metadata })
  }

  warn(message: string, metadata?: any): void {
    this.push({ type: 'log', level: LoggerLevel.Warn, message, metadata })
  }

  error(message: string, metadata?: any): void {
    this.push({ type: 'log', level: LoggerLevel.Error, message, metadata })
  }
}
