import { asyncMiddleware, AsyncMiddleware, gaId } from '@botpress/common'
import { Logger } from '@botpress/sdk'
import express, { RequestHandler, Router } from 'express'
import rewrite from 'express-urlrewrite'
import fs from 'fs'
import path from 'path'
import { ActionsRouter } from './actions/actions-router'
import { CloudRouter } from './cloud/cloud-router'
import { CMSRouter } from './cms/cms-router'
import { CodeEditorRouter } from './code-editor/code-editor-router'
import { ConfigRouter } from './config/config-router'
import { FlowsRouter } from './flows/flows-router'
import { HintsRouter } from './hints/hints-router'
import ManageRouter from './manage/manage-router'
import MediaRouter from './media/media-router'
import { NLURouter, NLUService } from './nlu'
import { QNARouter } from './qna'
import { HTTPServer } from './server'
import { TestingRouter } from './testing'

export interface StudioServices {
  logger: Logger
  nlu: NLUService
}

let indexCache: { [pageUrl: string]: string } = {}

setInterval(() => {
  indexCache = {}
}, 5000) // TODO: we probably don't want a page cache

export abstract class CustomRouter {
  protected readonly asyncMiddleware: AsyncMiddleware
  public readonly router: Router
  constructor(name: string, logger: Logger, router: Router) {
    this.asyncMiddleware = asyncMiddleware(logger, name)
    this.router = router
  }
}

export class StudioRouter extends CustomRouter {
  private checkTokenHeader: RequestHandler

  private cmsRouter: CMSRouter
  private mediaRouter: MediaRouter
  private actionsRouter: ActionsRouter
  private flowsRouter: FlowsRouter
  private hintsRouter: HintsRouter
  private configRouter: ConfigRouter
  private nluRouter: NLURouter
  private qnaRouter: QNARouter
  private testingRouter: TestingRouter
  private manageRouter: ManageRouter
  private codeEditorRouter: CodeEditorRouter
  private cloudRouter: CloudRouter

  constructor(logger: Logger, private httpServer: HTTPServer) {
    super('Studio', logger, Router({ mergeParams: true }))
    this.checkTokenHeader = (req, res, next) => next()

    const studioServices: StudioServices = {
      logger,
      nlu: new NLUService(logger)
    }

    this.cmsRouter = new CMSRouter(studioServices)
    this.actionsRouter = new ActionsRouter(studioServices)
    this.flowsRouter = new FlowsRouter(studioServices)
    this.mediaRouter = new MediaRouter(studioServices)
    this.hintsRouter = new HintsRouter(studioServices)
    this.configRouter = new ConfigRouter(studioServices)
    this.nluRouter = new NLURouter(studioServices)
    this.qnaRouter = new QNARouter(studioServices)
    this.testingRouter = new TestingRouter(studioServices)
    this.manageRouter = new ManageRouter(studioServices)
    this.codeEditorRouter = new CodeEditorRouter(studioServices)
    this.cloudRouter = new CloudRouter(studioServices)
  }

  async setupRoutes(app: express.Express) {
    this.actionsRouter.setupRoutes()
    this.flowsRouter.setupRoutes()
    await this.mediaRouter.setupRoutes()
    this.hintsRouter.setupRoutes()
    this.configRouter.setupRoutes()
    this.nluRouter.setupRoutes()
    this.qnaRouter.setupRoutes()
    this.testingRouter.setupRoutes()
    this.manageRouter.setupRoutes()
    this.codeEditorRouter.setupRoutes()
    this.cloudRouter.setupRoutes()

    app.use('/studio/manage', this.checkTokenHeader, this.manageRouter.router)

    app.use(rewrite('/studio/:botId/*env', '/api/v1/studio/:botId/env'))

    app.use('/api/v1/studio/:botId', this.router)

    // This route must be accessible even when the bot is disabled
    this.router.use('/config', this.checkTokenHeader, this.configRouter.router)

    this.router.get(
      '/workspaceBotsIds',
      this.checkTokenHeader,
      this.asyncMiddleware(async (req, res) => {
        res.send([])
      })
    )

    this.router.use('/actions', this.checkTokenHeader, this.actionsRouter.router)
    this.router.use('/cms', this.checkTokenHeader, this.cmsRouter.router)
    this.router.use('/nlu', this.checkTokenHeader, this.nluRouter.router)
    this.router.use('/qna', this.checkTokenHeader, this.qnaRouter.router)
    this.router.use('/testing', this.checkTokenHeader, this.testingRouter.router)
    this.router.use('/flows', this.checkTokenHeader, this.flowsRouter.router)
    this.router.use('/oldflows', this.checkTokenHeader, this.flowsRouter.router)
    this.router.use('/media', this.mediaRouter.router)
    this.router.use('/hints', this.checkTokenHeader, this.hintsRouter.router)
    this.router.use('/cloud', this.checkTokenHeader, this.cloudRouter.router)
    this.router.use('/code-editor', this.checkTokenHeader, this.codeEditorRouter.router)

    this.setupUnauthenticatedRoutes(app)
    this.setupStaticRoutes(app)
  }

  setupUnauthenticatedRoutes(app: any) {
    /**
     * UNAUTHENTICATED ROUTES
     * Do not return sensitive information there. These must be accessible by unauthenticated users
     */
    this.router.get(
      '/env',
      this.asyncMiddleware(async (req, res) => {
        const { botId } = req.params

        const favicon = 'assets/ui-studio/public/img/favicon.png'

        const commonEnv = await this.httpServer.getCommonEnv()

        const segmentWriteKey = process.core_env.BP_DEBUG_SEGMENT
          ? 'OzjoqVagiw3p3o1uocuw6kd2YYjm6CHi' // Dev key from Segment
          : '7lxeXxbGysS04TvDNDOROQsFlrls9NoY' // Prod key from Segment

        const host = process.env.EXTERNAL_URL || `http://localhost:${process.PORT}`
        const env = {
          ...commonEnv,
          STUDIO_VERSION: process.STUDIO_VERSION,
          ANALYTICS_ID: gaId,
          API_PATH: `${host}/api/v1`,
          BOT_API_PATH: `${host}/api/v1/bots/${botId}`,
          STUDIO_API_PATH: `${host}/api/v1/studio/${botId}`,
          BOT_ID: botId,
          BP_BASE_PATH: `studio/${botId}`,
          APP_NAME: 'Botpress Studio',
          APP_FAVICON: favicon,
          APP_CUSTOM_CSS: '',
          BOT_LOCKED: false,
          IS_BOT_MOUNTED: true,
          IS_CLOUD_BOT: true,
          SEGMENT_WRITE_KEY: segmentWriteKey,
          IS_PRO_ENABLED: process.IS_PRO_ENABLED,
          NLU_ENDPOINT: process.NLU_ENDPOINT,
          BP_SOCKET_URL: host
        }

        res.send(env)
      })
    )
  }

  setupStaticRoutes(app: any) {
    app.use('/:app(studio)/:botId', express.static(resolveStudioAsset('public'), { index: false }))
    app.use('/:app(studio)/:botId', resolveIndexPaths('public/index.html'))
    app.get(['/:app(studio)/:botId/*'], resolveIndexPaths('public/index.html'))
  }
}

// Dynamically updates the static paths of index files
const resolveIndexPaths = (page: string) => (req: any, res: any) => {
  res.contentType('text/html')

  // Not caching pages in dev (issue with webpack )
  if (indexCache[page] && process.IS_PRODUCTION) {
    return res.send(indexCache[page])
  } // TODO: we probably don't want a page cache

  fs.readFile(resolveStudioAsset(page), (err, data) => {
    if (data) {
      indexCache[page] = data
        .toString()
        .replace(/\<base href=\"\/\" ?\/\>/, `<base href="${process.ROOT_PATH}/" />`)
        .replace(/ROOT_PATH=""|ROOT_PATH = ''/, `window.ROOT_PATH="${process.ROOT_PATH}"`)

      res.send(indexCache[page])
    } else {
      res.sendStatus(404)
    }
  })
}

const resolveStudioAsset = (file: string) => {
  if (!process.pkg) {
    return path.resolve(process.STUDIO_LOCATION, '../../studio-ui/', file)
  }

  return path.resolve(process.STUDIO_LOCATION, 'ui/public', file)
}
