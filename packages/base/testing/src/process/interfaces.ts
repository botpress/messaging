export interface ServerOptions {
  command: string
  debug?: boolean | undefined
  launchTimeout?: number | undefined
  host?: string | undefined
  /**
   * Path to resource to wait for activity on before considering the server running. Must be used in conjunction with host and port.
   */
  path?: string | undefined
  protocol?: 'https' | 'http' | 'tcp' | 'socket' | undefined
  port?: number
}

export enum ErrorCode {
  ERROR_TIMEOUT = 'ERROR_TIMEOUT',
  ERROR_PORT_USED = 'ERROR_PORT_USED',
  ERROR_NO_COMMAND = 'ERROR_NO_COMMAND'
}

export class ServerError extends Error {
  constructor(message: string, private code: ErrorCode) {
    super(message)
  }
}
