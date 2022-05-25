import net from 'net'
import { ServerOptions } from './interfaces'

export const isPortTaken = async (config: ServerOptions) => {
  let server: net.Server

  const cleanupAndReturn = (result: boolean) =>
    new Promise((resolve) => {
      server.once('close', () => resolve(result)).close()
    })

  const isTaken = await new Promise((resolve, reject) => {
    server = net
      .createServer()
      .once('error', (err) => ((err as any).code === 'EADDRINUSE' ? resolve(cleanupAndReturn(true)) : reject()))
      .once('listening', () => resolve(cleanupAndReturn(false)))
      .listen(config.port, config.host)
  })

  return isTaken
}
