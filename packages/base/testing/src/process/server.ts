import { ChildProcessWithoutNullStreams, spawn } from 'child_process'
import clc from 'cli-color'
import cwd from 'cwd'
import stream from 'stream'
import kill from 'tree-kill'
import waitOn, { WaitOnOptions } from 'wait-on'

import { ServerError, ServerOptions, ErrorCode } from './interfaces'
import { isPortTaken } from './utils'

const DEFAULT_CONFIG: Partial<ServerOptions> = {
  debug: false,
  launchTimeout: 5000,
  host: 'localhost',
  protocol: 'http'
}

const servers: ChildProcessWithoutNullStreams[] = []

const startServer = (config: ServerOptions) => {
  if (!config.command) {
    throw new ServerError('You must define a `command`', ErrorCode.ERROR_NO_COMMAND)
  }

  const proc = spawn(config.command, {
    shell: true,
    env: process.env,
    cwd: cwd()
  })

  servers.push(proc)

  if (config.debug) {
    const serverLogPrefixer = new stream.Transform({
      transform(chunk, _encoding, callback) {
        this.push(clc.magentaBright(`[Server] ${chunk.toString()}`))
        callback()
      }
    })

    // eslint-disable-next-line no-console
    console.log(clc.magentaBright('Server output:'))
    proc.stdout.pipe(serverLogPrefixer).pipe(process.stdout)
  }
}

const configureServer = async (providedConfig: ServerOptions) => {
  const config = { ...DEFAULT_CONFIG, ...providedConfig }

  if (config.port) {
    const taken = await isPortTaken(config)
    if (taken) {
      throw new ServerError(`Port ${config.port} is in use`, ErrorCode.ERROR_PORT_USED)
    }
  }

  startServer(config)

  if (config.port) {
    const { launchTimeout, protocol, host, port, path } = config

    let resource = `${host}:${port}`
    if (path) {
      resource = `${resource}/${path}`
    }

    let url = ''
    if (protocol === 'tcp' || protocol === 'socket') {
      url = `${protocol}:${resource}`
    } else {
      url = `${protocol}://${resource}`
    }
    const opts: WaitOnOptions = {
      resources: [url],
      timeout: launchTimeout
    }

    try {
      await waitOn(opts)
    } catch (err) {
      if ((err as Error).message.startsWith('Timed out')) {
        throw new ServerError(`Server has taken more than ${launchTimeout}ms to start.`, ErrorCode.ERROR_TIMEOUT)
      }

      throw err
    }
  }
}

export const setupServer = async (providedConfigs: ServerOptions | ServerOptions[]) => {
  const configs = Array.isArray(providedConfigs) ? providedConfigs : [providedConfigs]

  await Promise.all(configs.map((providedConfig) => configureServer(providedConfig)))
}

export const getServers = () => {
  return servers
}

export const teardownServer = async () => {
  if (servers.length) {
    await Promise.all(servers.map((server) => server.pid && kill(server.pid)))
  }
}
