/** Interface for a logger that can be used to get better debugging */
export interface Logger {
  info(message: string, data?: any): void
  debug(message: string, data?: any): void
  warn(message: string, data?: any): void
  error(error: Error | undefined | unknown, message?: string, data?: any): void
}
