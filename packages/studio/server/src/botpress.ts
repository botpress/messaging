import * as sdk from 'botpress/sdk'

import fse from 'fs-extra'
import moment from 'moment'
import path from 'path'
import { setDebugScopes } from './debug'
import { AppLifecycle, AppLifecycleEvents } from './lifecycle'
import { copyDir } from './misc/fse-pkg'
import { GlobalEvents, StudioEvents } from './studio/events'
import { HTTPServer } from './studio/server'
import { RealtimeService } from './websocket'

export class Botpress {
  botpressPath: string
  configLocation: string
  api!: typeof sdk
  httpServer: HTTPServer
  logger: sdk.Logger
  realtime: RealtimeService

  constructor(logger: sdk.Logger) {
    this.botpressPath = path.join(process.cwd(), 'dist')
    this.configLocation = path.join(this.botpressPath, '/config')
    this.logger = logger
    this.httpServer = new HTTPServer(this.logger)
    this.realtime = new RealtimeService()
  }

  async start() {
    const beforeDt = moment()
    await this.initialize()
    const bootTime = moment().diff(beforeDt, 'milliseconds')
    this.logger.info(`Started in ${bootTime}ms`)
  }

  private async initialize() {
    setDebugScopes(process.core_env.DEBUG || '')

    AppLifecycle.setDone(AppLifecycleEvents.CONFIGURATION_LOADED)

    await this.httpServer.initialize()
    await this.checkJwtSecret()
    await this.checkNLUEndpoint()
    await this.initializeServices()
    await this.deployAssets()
    await this.startServer()
    await this.realtime.installOnHttpServer(this.httpServer.httpServer)
    // TODO: Mount bot

    // TODO: clean this logic

    GlobalEvents.events.on(StudioEvents.NLU_TRAINING_UPDATE, (payload) => {
      this.logger.info('NLU Training Progress') // TODO: this is just to show that logs work
      this.realtime.sendToSocket({
        eventName: 'statusbar.event',
        payload: {
          ...payload
        }
      })
    })

    GlobalEvents.events.on(StudioEvents.CONSOLE_LOGS, (payload) => {
      this.realtime.sendToSocket({
        eventName: 'logs::*',
        payload: {
          ...payload // TODO: Format "args" to have colors
        }
      })
    })

    AppLifecycle.setDone(AppLifecycleEvents.BOTPRESS_READY)
  }

  async checkJwtSecret() {
    process.APP_SECRET = process.env.APP_SECRET || '' // TODO: remove this
  }

  async checkNLUEndpoint() {
    process.NLU_ENDPOINT = process.env.NLU_ENDPOINT
  }

  async deployAssets() {
    try {
      const assets = path.resolve(process.DATA_LOCATION, 'assets/studio/ui')

      // Avoids overwriting the folder when developing locally on the studio
      if (fse.pathExistsSync(`${assets}/public`)) {
        const studioPath = fse.lstatSync(`${assets}/public`)
        if (studioPath.isSymbolicLink()) {
          return
        }
      }

      await copyDir(path.join(__dirname, '../../ui'), assets)
    } catch (err) {
      this.logger.attachError(err).error('Error deploying assets')
    }
  }

  private async initializeServices() {
    AppLifecycle.setDone(AppLifecycleEvents.SERVICES_READY)
  }

  private async startServer() {
    await this.httpServer.start()
    AppLifecycle.setDone(AppLifecycleEvents.HTTP_SERVER_READY)
  }
}
