import { Logger, ShutDownSignal } from '@botpress/messaging-engine'
import clc from 'cli-color'
import { Express } from 'express'
import { Server } from 'http'
import { createHttpTerminator, HttpTerminator } from 'http-terminator'
import ms from 'ms'
import portfinder from 'portfinder'
import yn from 'yn'

export class Launcher {
  private logger: Logger
  private shuttingDown: boolean = false
  private httpTerminator: HttpTerminator | undefined
  private readonly shutdownTimeout: number = ms('5s')

  constructor(
    private pkg: any,
    private name: string,
    private basePort: number,
    private express: Express,
    private setupCallback: () => Promise<void>,
    private startCallback: (server: Server) => Promise<void>,
    private monitorCallback: () => Promise<void>,
    private terminateCallback: () => Promise<void>,
    private destroyCallback: () => Promise<void>
  ) {
    this.logger = new Logger('Launcher')

    process.on('uncaughtException', async (e) => {
      this.logger.error(e, 'Uncaught Exception')
      await this.shutDown(1)
    })

    process.on('unhandledRejection', async (e) => {
      this.logger.error(e as Error, 'Unhandled Rejection')
      await this.shutDown(1)
    })

    process.on('SIGINT', async () => {
      await this.shutDown()
    })

    process.on('SIGHUP', async () => {
      await this.shutDown()
    })

    process.on('SIGUSR2', async () => {
      await this.shutDown()
    })

    process.on('SIGTERM', async () => {
      await this.shutDown()
    })
  }

  async launch() {
    try {
      this.printLogo()
      await this.setupCallback()

      let port = process.env.PORT
      if (!port) {
        portfinder.basePort = this.basePort
        port = (await portfinder.getPortPromise()).toString()
      }

      const server = this.express.listen(port)
      await this.startCallback(server)
      this.httpTerminator = createHttpTerminator({ server, gracefulTerminationTimeout: this.shutdownTimeout })

      this.logger.info(`Server is listening at: http://localhost:${port}`)

      const externalUrl = process.env.EXTERNAL_URL
      if (externalUrl?.length) {
        this.logger.info(`Server is exposed at: ${externalUrl}`)
      } else {
        this.logger.warn(
          "No external URL configured. Server might not behave as expected. Set the value for 'EXTERNAL_URL' to suppress this warning"
        )
      }

      await this.monitorCallback()
    } catch (e) {
      if (e instanceof ShutDownSignal) {
        await this.shutDown(e.code)
      } else {
        this.logger.error(e, 'Error occurred starting server')
        await this.shutDown(1)
      }
    }
  }

  async shutDown(code?: number) {
    if (yn(process.env.SPINNED)) {
      process.exit(code)
    } else if (!this.shuttingDown) {
      this.shuttingDown = true

      try {
        this.logger.info('Server gracefully closing down...')

        await this.terminateCallback()
        await this.httpTerminator?.terminate()
        await this.destroyCallback()

        this.logger.info('Server shutdown complete')
      } catch (e) {
        this.logger.error(e, 'Server failed to shutdown gracefully')
      } finally {
        process.exit(code)
      }
    }
  }

  private printLogo() {
    if (yn(process.env.NO_LOGO)) {
      return
    }

    this.logger.window([clc.bold(this.name), clc.blackBright(`Version ${this.pkg.version}`)], undefined, 75)
  }
}
