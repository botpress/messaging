export interface Logger {
  info(message: string, data?: any): void
  debug(message: string, data?: any): void
  warn(message: string, data?: any): void
  error(error: Error | undefined | unknown, message?: string, data?: any): void
}
