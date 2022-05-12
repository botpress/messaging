import { NLUProgressEvent, Training as BpTraining } from '@botpress/common'
import { Specifications as StanSpecifications } from '@botpress/nlu-client'
import { Logger } from '@botpress/sdk'
import _ from 'lodash'
import path from 'path'
import yn from 'yn'

import { AppLifecycle, AppLifecycleEvents } from '../../lifecycle'
import { GlobalEvents, StudioEvents } from '../../studio/events'
import { Instance } from '../../studio/utils/bpfs'
import { CLOUD_NLU_ENDPOINT } from '.'
import { Bot } from './bot'
import { BotFactory } from './bot-factory'
import { DefinitionsRepository } from './definitions-repository'
import { EntityRepository } from './entities-repo'
import { BotNotMountedError, NLUServiceNotInitializedError } from './errors'
import { IntentRepository } from './intent-repo'
import { ModelEntryRepository } from './model-entry'
import { NLUClient } from './nlu-client'
import { BotConfig } from './typings'

interface ServerInfo {
  specs: StanSpecifications
  languages: string[]
}

interface SubServices {
  baseClient: NLUClient
  botFactory: BotFactory
  queueTrainingsOnBotMount: boolean
}

export class NLUService {
  public entities: EntityRepository
  public intents: IntentRepository

  private _bots: _.Dictionary<Bot> = {}
  private _app: SubServices | undefined

  constructor(private _logger: Logger) {
    this.entities = new EntityRepository(this)
    this.intents = new IntentRepository(this)
  }

  public isReady(): boolean {
    return !!this._app
  }

  public async initialize() {
    // if (!process.NLU_ENDPOINT) {
    //   throw new Error('NLU Service expects variable "NLU_ENDPOINT" to be set.')
    // }

    const queueTrainingOnBotMount = false
    const trainingEnabled = !yn(process.env.BP_NLU_DISABLE_TRAINING)

    const baseClient = new NLUClient({
      baseURL: CLOUD_NLU_ENDPOINT // process.NLU_ENDPOINT
    })

    const socket = this._getWebsocket()

    const modelRepo = new ModelEntryRepository()

    const defRepo = new DefinitionsRepository(this.entities, this.intents)
    const botFactory = new BotFactory(this._logger, defRepo, modelRepo, socket, CLOUD_NLU_ENDPOINT)

    this._app = {
      baseClient,
      botFactory,
      queueTrainingsOnBotMount: trainingEnabled && !!queueTrainingOnBotMount
    }
  }

  public async teardown() {
    for (const botId of Object.keys(this._bots)) {
      await this.unmountBot(botId)
    }
  }

  public async getInfo(): Promise<ServerInfo | undefined> {
    if (!this._app) {
      throw new NLUServiceNotInitializedError()
    }

    try {
      const info = await this._app.baseClient.getInfo()
      return info
    } catch (err) {
      this._logger.attachError(err).error('An error occured when fetch info from NLU Server.')
      return
    }
  }

  public async mountBot(botId: string) {
    await AppLifecycle.waitFor(AppLifecycleEvents.SERVICES_READY)
    if (!this._app) {
      throw new NLUServiceNotInitializedError()
    }

    const botConfig: BotConfig = await Instance.readFile('bot.config.json').then((buf) => JSON.parse(buf.toString()))

    const bot = await this._app.botFactory.makeBot(botConfig)
    this._bots[botId] = bot
    return bot.mount({
      queueTraining: this._app.queueTrainingsOnBotMount
    })
  }

  public async unmountBot(botId: string) {
    await AppLifecycle.waitFor(AppLifecycleEvents.SERVICES_READY)
    if (!this._app) {
      throw new NLUServiceNotInitializedError()
    }

    const bot = this._bots[botId]
    if (!bot) {
      throw new BotNotMountedError(botId)
    }

    await bot.unmount()
    delete this._bots[botId]
  }

  public async getLanguages(): Promise<string[]> {
    if (!this._app) {
      throw new NLUServiceNotInitializedError()
    }

    const { languages } = await this._app.baseClient.getInfo()
    return languages
  }

  public getBot(botId: string): Bot {
    const bot = this._bots[botId]
    if (!bot) {
      throw new BotNotMountedError(botId)
    }
    return bot
  }

  public async queueTraining(botId: string, language: string) {
    const bot = this._bots[botId]
    if (!bot) {
      throw new BotNotMountedError(botId)
    }
    // the Bot SM class will report progress and handle errors
    void bot.train(language)
  }

  public async downloadAndSaveModelWeights(botId: string) {
    const bot = this._bots[botId]
    if (!bot) {
      throw new BotNotMountedError(botId)
    }

    const botConfig: BotConfig = await Instance.readFile('bot.config.json').then((buf) => JSON.parse(buf.toString()))

    if (!botConfig.nluModels) {
      throw new Error('Missing NLU models. Bot is not trained.')
    }

    const modelsFolder = 'models'
    await Instance.deleteDir(modelsFolder)

    for (const lang of Object.keys(botConfig.nluModels)) {
      const modelId = botConfig.nluModels[lang]
      const modelWeights = await bot.downloadModelWeights(botId, modelId)

      await Instance.upsertFile(path.join(modelsFolder, `${modelId}.model`), modelWeights)
    }
  }

  private _getWebsocket = () => {
    return async (ts: BpTraining) => {
      const ev: NLUProgressEvent = { type: 'nlu', ...ts }
      GlobalEvents.fireEvent(StudioEvents.NLU_TRAINING_UPDATE, ev)
    }
  }
}
