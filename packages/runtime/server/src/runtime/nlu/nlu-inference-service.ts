import { IO, Logger } from 'botpress/runtime-sdk'
import { inject, injectable } from 'inversify'
import _ from 'lodash'
import yn from 'yn'
import { ConfigProvider } from '../config'
import { WellKnownFlags } from '../dialog'
import { EventEngine } from '../events'
import { TYPES } from '../types'

import naturalElection from './election/natural-election'
import pickSpellChecked from './election/spellcheck-handler'
import { BotNotMountedError } from './errors'
import { NLUClient } from './nlu-client'
import { isLocalHost } from './nlu-client/localhost'
import { Predictor } from './predictor'

const EVENTS_TO_IGNORE = ['session_reference', 'session_reset', 'bp_dialog_timeout', 'visit', 'say_something', '']
const PREDICT_MW = 'nlu-predict.incoming'

interface PredictionArgs {
  utterance: string
  includedContexts: string[]
  skipSpellcheck?: boolean
  language?: string
}

/**
 * This service takes care of the nlu inferences (predictions)
 *
 * It belongs in the runtime and only in the runtime.
 * It is not responsible for CRUD on intent and entity files.
 * It is not responsible for trainings and the models state-machine.
 * It expects bot config to have field nluModels.
 * It expects botpress config to have field nlu.
 * That's it.
 */
@injectable()
export class NLUInferenceService {
  private nluEnabled: boolean = false
  private _nluEndpoint!: string
  private _clientPerBot: Dic<NLUClient> = {}
  private predictors: { [botId: string]: Predictor } = {}

  constructor(
    @inject(TYPES.EventEngine) private eventEngine: EventEngine,
    @inject(TYPES.ConfigProvider) private configProvider: ConfigProvider,
    @inject(TYPES.Logger) private logger: Logger
  ) {}

  public async initialize() {
    if (!process.NLU_ENDPOINT) {
      this.logger.warn('No NLU endpoint provided, some features will not work as expected.')
      return
    }

    this._nluEndpoint = process.NLU_ENDPOINT

    this.eventEngine.register({
      name: PREDICT_MW,
      description:
        'Process natural language in the form of text. Structured data with an action and parameters for that action is injected in the incoming message event.',
      order: 100,
      timeout: '6s',
      direction: 'incoming',
      handler: this.handleIncomingEvent.bind(this)
    })

    this.nluEnabled = true
    this.logger.info(`Using NLU server at ${process.NLU_ENDPOINT}`)
  }

  public async teardown() {
    this.eventEngine.removeMiddleware(PREDICT_MW)
  }

  public async mountBot(botId: string) {
    if (!this.nluEnabled) {
      return
    }

    const botConfig = await this.configProvider.getBotConfig(botId)

    const endpoint = this._nluEndpoint
    const isLocal = isLocalHost(endpoint)
    const client = new NLUClient({ endpoint, isLocal, cloud: botConfig.cloud })
    this._clientPerBot[botId] = client

    const modelIdGetter = this._modelIdGetter(botId)

    const predictor = new Predictor(botId, botConfig.defaultLanguage, client, modelIdGetter, this.logger)
    this.predictors[botId] = predictor
  }

  public async unmountBot(botId: string) {
    if (!this.nluEnabled) {
      return
    }

    delete this._clientPerBot[botId]
    delete this.predictors[botId]
  }

  public async predict(botId: string, args: PredictionArgs): Promise<IO.EventUnderstanding> {
    const bot = this.predictors[botId]
    if (!bot) {
      throw new BotNotMountedError(botId)
    }

    const { includedContexts, utterance, language } = args
    const skipSpellcheck: boolean = args.skipSpellcheck ?? yn(process.env.NLU_SKIP_SPELLCHECK)
    const t0 = Date.now()

    const predOutput = await bot.predict(utterance, language)

    const appendTime = <T>(eu: T) => ({ ...eu, ms: Date.now() - t0 })

    let nluResults = { ...predOutput, includedContexts }
    if (nluResults.spellChecked && nluResults.spellChecked !== utterance && !skipSpellcheck) {
      const predOutput = await bot.predict(nluResults.spellChecked, language)
      const spellCheckedResults = { ...predOutput, includedContexts }
      nluResults = pickSpellChecked(appendTime(nluResults), appendTime(spellCheckedResults))
    }

    const electionInput = appendTime(nluResults)
    return naturalElection(electionInput)
  }

  private _modelIdGetter = (botId: string) => async (): Promise<Dic<string>> => {
    // TODO: implement some caching to prevent from reading bot config at each predict
    const botConfig = await this.configProvider.getBotConfig(botId)
    return botConfig.nluModels ?? {}
  }

  private handleIncomingEvent = async (event: IO.Event, next: IO.MiddlewareNextCallback) => {
    const incomingEvent = event as IO.IncomingEvent
    if (await this._ignoreEvent(incomingEvent)) {
      return next(undefined, false, true)
    }

    try {
      const { botId, preview } = incomingEvent
      const anticipatedLanguage: string | undefined = incomingEvent.state.user?.language
      const includedContexts = incomingEvent.nlu?.includedContexts ?? []

      const nlu: IO.EventUnderstanding = await this.predict(botId, {
        utterance: preview,
        includedContexts,
        language: anticipatedLanguage
      })

      _.merge(incomingEvent, { nlu })
      this.removeSensitiveText(incomingEvent)
    } catch (thrown) {
      const err = thrown instanceof Error ? thrown : new Error(`${thrown}`)
      this.logger.warn(`Error extracting metadata for incoming text: ${err.message}`)
    } finally {
      next()
    }
  }

  private removeSensitiveText = (event: IO.IncomingEvent) => {
    if (!event.nlu || !event.nlu.entities || !event.payload.text) {
      return
    }

    try {
      const sensitiveEntities = event.nlu.entities.filter(ent => ent.meta.sensitive)
      for (const entity of sensitiveEntities) {
        const stars = '*'.repeat(entity.data.value.length)
        event.payload.text = event.payload.text.replace(entity.data.value, stars)
      }
    } catch (thrown) {
      const err = thrown instanceof Error ? thrown : new Error(`${thrown}`)
      this.logger.warn(`Error removing sensitive information: ${err.message}`)
    }
  }

  private _ignoreEvent = async (event: IO.IncomingEvent) => {
    return (
      !this.predictors[event.botId] ||
      !event.preview ||
      EVENTS_TO_IGNORE.includes(event.type) ||
      event.hasFlag(WellKnownFlags.SKIP_NATIVE_NLU)
    )
  }
}
