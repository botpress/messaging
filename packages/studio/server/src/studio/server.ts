import { machineUUID } from '@botpress/common'
import { Logger } from '@botpress/sdk'
import { Promise } from 'bluebird'
import bodyParser from 'body-parser'

import compression from 'compression'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import errorHandler from 'errorhandler'
import express from 'express'
import { createServer, Server } from 'http'
import { createProxyMiddleware, fixRequestBody } from 'http-proxy-middleware'

import onHeaders from 'on-headers'
import path from 'path'
import portFinder from 'portfinder'
import { URL } from 'url'
import yn from 'yn'
import { AppLifecycle, AppLifecycleEvents } from '../lifecycle'
import { StudioRouter } from './studio-router'

import { debugRequestMw, resolveStudioAsset } from './utils/server-utils'

export const monitoringMiddleware = (req: any, res: any, next: any) => {
  const startAt = Date.now()

  onHeaders(res, () => {
    const timeInMs = Date.now() - startAt

    res.setHeader('X-Response-Time', `${timeInMs}ms`)
  })

  next()
}

export class HTTPServer {
  public httpServer!: Server
  public readonly app: express.Express
  private isBotpressReady = false
  private machineId!: string

  private readonly studioRouter!: StudioRouter

  constructor(private logger: Logger) {
    this.app = express()

    if (!process.IS_PRODUCTION) {
      this.app.use(errorHandler())
    }

    if (process.core_env.REVERSE_PROXY) {
      const boolVal = yn(process.core_env.REVERSE_PROXY)
      this.app.set('trust proxy', boolVal === null ? process.core_env.REVERSE_PROXY : boolVal)
    }

    this.app.use(debugRequestMw)

    if (!yn(process.core_env.BP_HTTP_DISABLE_GZIP)) {
      this.app.use(compression())
    }

    this.studioRouter = new StudioRouter(logger, this)
  }

  async setupRootPath() {
    const externalUrl = process.env.EXTERNAL_URL || '' // TODO: fix this config

    if (!externalUrl) {
      process.ROOT_PATH = ''
    } else {
      const pathname = new URL(externalUrl).pathname
      process.ROOT_PATH = pathname.replace(/\/+$/, '')
    }
  }

  async initialize() {
    this.machineId = await machineUUID()
    await AppLifecycle.waitFor(AppLifecycleEvents.CONFIGURATION_LOADED)
    await this.setupRootPath()

    const app = express()
    app.use(process.ROOT_PATH, this.app)
    this.httpServer = createServer(app)

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    AppLifecycle.waitFor(AppLifecycleEvents.BOTPRESS_READY).then(() => {
      this.isBotpressReady = true
    })
  }

  async getCommonEnv() {
    const config = {
      sendUsageStats: true,
      USE_JWT_COOKIES: false, // TODO: not sure why we would want that
      experimental: false,
      showPoweredBy: true
    }

    return {
      SEND_USAGE_STATS: config.sendUsageStats,
      USE_JWT_COOKIES: process.USE_JWT_COOKIES,
      EXPERIMENTAL: config.experimental,
      SHOW_POWERED_BY: !!config.showPoweredBy,
      UUID: this.machineId,
      BP_SERVER_URL: process.env.BP_SERVER_URL || '',
      IS_STANDALONE: process.IS_STANDALONE
    }
  }

  async setupCoreProxy() {
    // If none is set, this means there's no server available for some requests
    if (!process.env.BP_SERVER_URL && !process.core_env.CORE_PORT) {
      return
    }

    const target = process.env.BP_SERVER_URL || `http://localhost:${process.core_env.CORE_PORT}`
    this.app.use(
      createProxyMiddleware({
        target,
        changeOrigin: true,
        logLevel: 'silent',
        onProxyReq: (proxyReq, req) => {
          // Prevent redirecting studio URL to the main process
          if (req.originalUrl.includes('/studio')) {
            proxyReq.abort()
          }

          return fixRequestBody(proxyReq, req)
        }
      })
    )
  }

  async start() {
    const defaultConfig = {
      jwtToken: { useCookieStorage: false },
      headers: {
        'X-Powered-By': 'Botpress/Studio'
      },
      bodyLimit: '10mb',
      cors: {
        enabled: true
      },
      host: 'localhost',
      port: 3300,
      externalUrl: null,
      backlog: 100
    }

    process.USE_JWT_COOKIES = yn(defaultConfig.jwtToken.useCookieStorage) || false

    /**
     * The loading of language models can take some time, access to Botpress is disabled until it is completed
     * During this time, internal calls between modules can be made
     */
    this.app.use((req, res, next) => {
      res.removeHeader('X-Powered-By') // Removes the default X-Powered-By: Express
      res.set(defaultConfig.headers)
      if (!this.isBotpressReady) {
        return res
          .status(503)
          .send(
            '<html><head><meta http-equiv="refresh" content="2"> </head><body>Botpress is loading. Please try again in a minute.</body></html>'
          )
      }

      next()
    })

    this.app.use(monitoringMiddleware)

    // if (config.session && config.session.enabled) {
    //   this.app.use(
    //     session({
    //       secret: process.APP_SECRET,
    //       secure: true,
    //       httpOnly: true,
    //       domain: config.externalUrl,
    //       maxAge: ms(config.session.maxAge)
    //     })
    //   )
    // } // TODO: is this needed?

    if (process.USE_JWT_COOKIES) {
      this.app.use(cookieParser())
    }

    this.app.use(bodyParser.json({ limit: defaultConfig.bodyLimit }))
    this.app.use(bodyParser.urlencoded({ extended: true }))

    if (defaultConfig.cors?.enabled) {
      this.app.use(cors())
    }

    this.app.use(
      '/assets/studio/ui',
      this.guardWhiteLabel(), // TODO: remove this
      express.static(resolveStudioAsset(''), { fallthrough: false })
    )

    await this.studioRouter.setupRoutes(this.app)

    this.app.use((err: any, _req: any, _res: any, next: any) => {
      if (err.statusCode === 413) {
        this.logger.error('You may need to increase httpServer.bodyLimit in file data/global/botpress.config.json')
      }
      next(err)
    })

    this.app.use(function handleUnexpectedError(err: any, req: any, res: any, next: any) {
      const statusCode = err.statusCode || 400
      const errorCode = err.errorCode
      const message = err.message || err || 'Unexpected error'
      const details = err.details || ''
      const docs = err.docs || 'https://botpress.com/docs'
      const devOnly = process.IS_PRODUCTION ? {} : { showStackInDev: true, stack: err.stack, full: err.message }

      res.status(statusCode).json({
        statusCode,
        errorCode,
        type: err.type || Object.getPrototypeOf(err).name || 'Exception',
        message,
        details,
        docs,
        ...devOnly
      })
    })

    process.HOST = defaultConfig.host
    process.PORT = await portFinder.getPortPromise({ port: process.core_env.STUDIO_PORT || defaultConfig.port })
    process.LOCAL_URL = `http://localhost:${process.PORT}${process.ROOT_PATH}`
    process.EXTERNAL_URL =
      process.env.EXTERNAL_URL || defaultConfig.externalUrl || `http://${process.HOST}:${process.PORT}`

    await Promise.fromCallback((callback) => {
      this.httpServer.listen(process.PORT, undefined, defaultConfig.backlog, () => callback(undefined))
    })

    await this.setupCoreProxy()

    return this.app
  }

  private guardWhiteLabel() {
    return (req: any, res: any, next: any) => {
      // TODO: remove this
      if (path.normalize(req.path) === '/custom-theme.css' && (!process.IS_PRO_ENABLED || !process.IS_LICENSED)) {
        return res.sendStatus(404)
      }
      next()
    }
  }
}
