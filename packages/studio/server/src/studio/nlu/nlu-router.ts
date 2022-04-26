import * as sdk from 'botpress/sdk'
import { Response as ExpressResponse } from 'express'
import { validate } from 'joi'
import _ from 'lodash'
import yn from 'yn'
import { EntityDefCreateSchema, IntentDefCreateSchema } from '../../common/validation'
import { StudioServices } from '../studio-router'
import { Instance } from '../utils/bpfs'
import { CustomStudioRouter } from '../utils/custom-studio-router'
import { NLUService } from '.'
import { BotNotMountedError } from './errors'

const removeSlotsFromUtterances = (utterances: { [key: string]: any }, slotNames: string[]) =>
  _.fromPairs(
    Object.entries(utterances).map(([key, val]) => {
      const regex = new RegExp(`\\[([^\\[\\]\\(\\)]+?)\\]\\((${slotNames.join('|')})\\)`, 'gi')
      return [key, val.map((u: any) => u.replace(regex, '$1'))]
    })
  )

export class NLURouter extends CustomStudioRouter {
  private service: NLUService = new NLUService(this.logger)

  constructor(services: StudioServices) {
    super('NLU', services.logger)

    // TODO: Move this in the application instead of router
    void this.service.initialize().then(async (x) => {
      const botConfig = (await Instance.readFile('bot.config.json')).toString()
      const botInfo = JSON.parse(botConfig) as sdk.BotConfig
      await this.service.mountBot(botInfo.id)
    })
  }

  setupRoutes() {
    this.router.get(
      '/intents',
      this.needPermissions('read', 'bot.content'),
      this.asyncMiddleware(async (req, res) => {
        const { botId } = req.params
        const intentDefs = await this.service.intents.getIntents(botId)
        res.send(intentDefs)
      })
    )

    this.router.get(
      '/intents/:intent',
      this.needPermissions('read', 'bot.content'),
      this.asyncMiddleware(async (req, res) => {
        const { botId, intent } = req.params
        const intentDef = await this.service.intents.getIntent(botId, intent)
        res.send(intentDef)
      })
    )

    this.router.post(
      '/intents/:intent/delete',
      this.needPermissions('write', 'bot.content'),
      this.asyncMiddleware(async (req, res) => {
        const { botId, intent } = req.params
        try {
          await this.service.intents.deleteIntent(botId, intent)
          await this.service.getBot(botId).refreshNeedsTraining()
          res.sendStatus(204)
        } catch (err: any) {
          this.logger.attachError(err).error('Could not delete intent')
          res.status(400).send(err.message)
        }
      })
    )

    this.router.post(
      '/intents',
      this.needPermissions('write', 'bot.content'),
      this.asyncMiddleware(async (req, res) => {
        const { botId } = req.params
        try {
          const intentDef = await validate(req.body, IntentDefCreateSchema, {
            stripUnknown: true
          })

          await this.service.intents.saveIntent(botId, intentDef)
          await this.service.getBot(botId).refreshNeedsTraining()

          res.sendStatus(200)
        } catch (err: any) {
          this.logger.attachError(err).warn('Cannot create intent')
          res.status(400).send(err.message)
        }
      })
    )

    this.router.post(
      '/intents/:intentName',
      this.needPermissions('write', 'bot.content'),
      this.asyncMiddleware(async (req, res) => {
        const { botId, intentName } = req.params
        try {
          await this.service.intents.updateIntent(botId, intentName, req.body)
          await this.service.getBot(botId).refreshNeedsTraining()
          res.sendStatus(200)
        } catch (err) {
          this.logger.attachError(err).error('Could not update intent')
          res.sendStatus(400)
        }
      })
    )

    this.router.get(
      '/contexts',
      this.needPermissions('read', 'bot.content'),
      this.asyncMiddleware(async (req, res) => {
        const botId = req.params.botId
        const intents = await this.service.intents.getIntents(botId)
        const ctxs = _.chain(intents)
          .flatMap((i) => i.contexts)
          .uniq()
          .value()

        res.send(ctxs)
      })
    )

    this.router.get(
      '/entities',
      this.needPermissions('read', 'bot.content'),
      this.asyncMiddleware(async (req, res) => {
        const { botId } = req.params
        const { ignoreSystem } = req.query

        const entities = await this.service.entities.listEntities(botId)
        const mapped = entities.map((x) => ({ ...x, label: `${x.type}.${x.name}` }))

        res.json(yn(ignoreSystem) ? mapped.filter((x) => x.type !== 'system') : mapped)
      })
    )

    this.router.get(
      '/entities/:entityName',
      this.needPermissions('read', 'bot.content'),
      this.asyncMiddleware(async (req, res) => {
        const { botId, entityName } = req.params
        try {
          const entity = await this.service.entities.getEntity(botId, entityName)
          res.send(entity)
        } catch (err) {
          this.logger.attachError(err).error(`Could not get entity ${entityName}`)
          res.sendStatus(400)
        }
      })
    )

    this.router.post(
      '/entities',
      this.needPermissions('write', 'bot.content'),
      this.asyncMiddleware(async (req, res) => {
        const { botId } = req.params
        try {
          const entityDef = (await validate(req.body, EntityDefCreateSchema, {
            stripUnknown: true
          })) as sdk.NLU.EntityDefinition

          await this.service.entities.saveEntity(botId, entityDef)
          await this.service.getBot(botId).refreshNeedsTraining()
          res.sendStatus(200)
        } catch (err: any) {
          this.logger.attachError(err).warn('Cannot create entity')
          res.status(400).send(err.message)
        }
      })
    )

    this.router.post(
      '/entities/:id',
      this.needPermissions('write', 'bot.content'),
      this.asyncMiddleware(async (req, res) => {
        const { botId, id } = req.params
        try {
          const entityDef = (await validate(req.body, EntityDefCreateSchema, {
            stripUnknown: true
          })) as sdk.NLU.EntityDefinition

          await this.service.entities.updateEntity(botId, id, entityDef)
          await this.service.getBot(botId).refreshNeedsTraining()
          res.sendStatus(200)
        } catch (err: any) {
          this.logger.attachError(err).error('Could not update entity')
          res.status(400).send(err.message)
        }
      })
    )

    this.router.post(
      '/entities/:id/delete',
      this.needPermissions('write', 'bot.content'),
      this.asyncMiddleware(async (req, res) => {
        const { botId, id } = req.params
        try {
          await this.service.entities.deleteEntity(botId, id)

          const affectedIntents = (await this.service.intents.getIntents(botId)).filter((intent) =>
            intent.slots.some((slot) => slot.entities.includes(id))
          )

          await Promise.map(affectedIntents, (intent) => {
            const [affectedSlots, unaffectedSlots] = _.partition(intent.slots, (slot) => slot.entities.includes(id))
            const [slotsToDelete, slotsToKeep] = _.partition(affectedSlots, (slot) => slot.entities.length === 1)
            const updatedIntent = {
              ...intent,
              slots: [
                ...unaffectedSlots,
                ...slotsToKeep.map((slot) => ({ ...slot, entities: _.without(slot.entities, id) }))
              ],
              utterances: removeSlotsFromUtterances(
                intent.utterances,
                slotsToDelete.map((slot) => slot.name)
              )
            }
            return this.service.intents.saveIntent(botId, updatedIntent)
          })

          await this.service.getBot(botId).refreshNeedsTraining()

          res.sendStatus(204)
        } catch (err: any) {
          this.logger.attachError(err).error('Could not delete entity')
          res.status(404).send(err.message)
        }
      })
    )

    /**
     *
     * #######################################
     * ### Trainings / Models :  Lifecycle ###
     * #######################################
     */

    // TODO Move in FE
    this.router.get(
      ['/health', '/info'],
      this.asyncMiddleware(async (req, res) => {
        if (!this.service.isReady()) {
          return res.sendStatus(200)
        }

        const info = await this.service.getInfo()
        if (!info) {
          return res.status(404).send('NLU Server is unreachable')
        }
        return res.send(info)
      })
    )

    this.router.get(
      '/training/:language',
      this.needPermissions('read', 'bot.training'),
      this.asyncMiddleware(async (req, res) => {
        const { language: lang, botId } = req.params

        try {
          if (!this.service.isReady()) {
            return res.sendStatus(200)
          }
          const state = await this.service.getBot(botId).syncAndGetState(lang)
          res.send(state)
        } catch (error: any) {
          return this._mapError({ botId, error }, res)
        }
      })
    )

    this.router.post(
      '/train/:lang',
      this.needPermissions('write', 'bot.training'),
      this.asyncMiddleware(async (req, res) => {
        const { botId, lang } = req.params
        try {
          const disableTraining = yn(process.env.BP_NLU_DISABLE_TRAINING)
          if (!disableTraining && this.service.isReady()) {
            await this.service.queueTraining(botId, lang)
          }
          res.sendStatus(200)
        } catch (error: any) {
          return this._mapError({ botId, error }, res)
        }
      })
    )

    this.router.post(
      '/train/:lang/delete',
      this.needPermissions('write', 'bot.training'),
      this.asyncMiddleware(async (req, res) => {
        const { botId, lang } = req.params
        try {
          if (!this.service.isReady()) {
            return res.sendStatus(200)
          }
          await this.service.getBot(botId).cancelTraining(lang)
          res.sendStatus(200)
        } catch (error: any) {
          return this._mapError({ botId, error }, res)
        }
      })
    )
  }

  private _mapError = (err: { botId: string; error: Error }, res: ExpressResponse) => {
    const { error, botId } = err
    if (error instanceof BotNotMountedError) {
      return res.status(404).send(`Bot "${error.botId}" doesn't exist`)
    }

    const msg = 'An unexpected error occured.'
    this.logger.attachError(error).error(msg)
    return res.status(500).send(msg)
  }
}
