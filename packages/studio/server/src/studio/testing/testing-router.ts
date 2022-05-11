import * as sdk from '@botpress/sdk'
import _ from 'lodash'
import { StudioServices } from '../studio-router'

import { CustomStudioRouter } from '../utils/custom-studio-router'
import { TestingService } from '.'

export class TestingRouter extends CustomStudioRouter {
  private testingService = new TestingService(this.logger)

  constructor(services: StudioServices) {
    super('Testing', services.logger, services.nlu)
    this.setupRoutes()
  }

  setupRoutes() {
    const router = this.router

    router.get(
      '/scenarios',
      this.asyncMiddleware(async (req, res) => {
        const scenarios = await this.testingService.forBot(req.params.botId).getScenarios()
        const status = this.testingService.forBot(req.params.botId).getState()

        res.send({ scenarios, status })
      })
    )

    router.post(
      '/deleteScenario',
      this.asyncMiddleware(async (req, res) => {
        if (!req.body.name) {
          return res.sendStatus(400)
        }

        await this.testingService.forBot(req.params.botId).deleteScenario(req.body.name)

        res.sendStatus(200)
      })
    )

    router.post(
      '/runAll',
      this.asyncMiddleware(async (req, res) => {
        await this.testingService.forBot(req.params.botId).executeAll()

        res.sendStatus(200)
      })
    )

    router.post(
      '/run',
      this.asyncMiddleware(async (req, res) => {
        await this.testingService.forBot(req.params.botId).executeSingle(req.body.scenario)

        res.sendStatus(200)
      })
    )

    router.post(
      '/startRecording',
      this.asyncMiddleware(async (req, res) => {
        if (!req.body.userId) {
          return res.sendStatus(400)
        }

        await this.testingService.forBot(req.params.botId).startRecording(req.body.userId)

        res.sendStatus(200)
      })
    )

    router.post(
      '/stopRecording',
      this.asyncMiddleware(async (req, res) => {
        const scenario = this.testingService.forBot(req.params.botId).endRecording()

        res.send(scenario)
      })
    )

    router.post(
      '/saveScenario',
      this.asyncMiddleware(async (req, res) => {
        const { name, steps } = req.body
        if (!name || !steps || !name.length) {
          return res.sendStatus(400)
        }

        await this.testingService.forBot(req.params.botId).saveScenario(name, steps)

        res.sendStatus(200)
      })
    )

    router.post(
      '/buildScenario',
      this.asyncMiddleware(async (req, res) => {
        const scenario = await this.testingService.forBot(req.params.botId).buildScenario(req.body.eventIds)

        res.send(scenario)
      })
    )

    router.post(
      '/deleteAllScenarios',
      this.asyncMiddleware(async (req, res) => {
        await this.testingService.forBot(req.params.botId).deleteAllScenarios()

        return res.sendStatus(200)
      })
    )

    router.post(
      '/incomingEvent',
      this.asyncMiddleware(async (req, res) => {
        const event = req.body as sdk.IO.IncomingEvent

        const eventState = await this.testingService.forBot(req.params.botId).processIncomingEvent(event)

        res.send(eventState)
      })
    )

    router.post(
      '/processedEvent',
      this.asyncMiddleware(async (req, res) => {
        const event = req.body as sdk.IO.IncomingEvent

        await this.testingService.forBot(req.params.botId).processCompletedEvent(event)

        return res.sendStatus(200)
      })
    )

    router.post(
      '/fetchPreviews',
      this.asyncMiddleware(async (req, res) => {
        const { elementIds } = req.body
        if (!elementIds || !_.isArray(elementIds)) {
          return res.sendStatus(400)
        }

        const previews = await this.testingService.forBot(req.params.botId).fetchPreviews(elementIds)

        res.send(previews)
      })
    )
  }
}
