import * as Sentry from '@sentry/node'
import cors from 'cors'
import express, { Router } from 'express'
import yn from 'yn'

export class Routes {
  router: Router

  constructor(private root: Router) {
    this.router = Router()
  }

  setup(pkg: any) {
    this.setupApm()
    this.setupPassword()

    this.root.get('/status', (req, res) => {
      res.sendStatus(200)
    })
    this.root.get('/version', (req, res) => {
      res.send(pkg.version)
    })

    this.root.use('/api/v1', this.router)
    this.router.use(
      cors({
        origin: '*',
        methods: ['GET', 'POST', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization', 'Content-Length']
      })
    )
    this.router.use(express.json({ limit: '100kb' }))
    this.router.use(express.urlencoded({ extended: true }))
  }

  postSetup() {
    this.setupApmErrorHandler()
  }

  setupApm() {
    const apmEnabled = yn(process.env.APM_ENABLED)

    if (apmEnabled) {
      Sentry.init({
        integrations: [new Sentry.Integrations.Http({})]
      })

      this.root.use(Sentry.Handlers.requestHandler())
    }
  }

  setupPassword() {
    const password = process.env.INTERNAL_PASSWORD
    if (!password) {
      return
    }

    this.root.use('/api', (req, res, next) => {
      if (req.headers.password === password) {
        next()
      } else {
        res.sendStatus(403)
      }
    })
  }

  setupApmErrorHandler() {
    const apmEnabled = yn(process.env.APM_ENABLED)

    if (apmEnabled) {
      this.root.use(Sentry.Handlers.errorHandler())
    }
  }
}
