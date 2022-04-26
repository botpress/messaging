import { Logger } from 'botpress/sdk'
import _ from 'lodash'
import { Bot } from './bot'
import { DefinitionsRepository } from './definitions-repository'
import { ModelEntryService, TrainingEntryService, ModelEntryRepository } from './model-entry'
import { NLUClient } from './nlu-client'
import pickSeed from './pick-seed'

import { BotDefinition, BotConfig, TrainListener } from './typings'

export class BotFactory {
  constructor(
    private _logger: Logger,
    private _defRepo: DefinitionsRepository,
    private _modelStateRepo: ModelEntryRepository,
    private _webSocket: TrainListener,
    private _nluEndpoint: string
  ) {}

  public makeBot = async (botConfig: BotConfig): Promise<Bot> => {
    const { id: botId, cloud } = botConfig

    const baseURL = cloud ? process.CLOUD_NLU_ENDPOINT : this._nluEndpoint
    const nluClient = new NLUClient({ baseURL, cloud })

    const { defaultLanguage } = botConfig
    const { languages: engineLanguages } = await nluClient.getInfo()
    const languages = _.intersection(botConfig.languages, engineLanguages)
    if (botConfig.languages.length !== languages.length) {
      const missingLangMsg = `Bot ${botId} has configured languages that are not supported by language sources. Configure a before incoming hook to call an external NLU provider for those languages.`
      this._logger.warn(missingLangMsg, { notSupported: _.difference(botConfig.languages, languages) })
    }

    const botDefinition: BotDefinition = {
      botId,
      defaultLanguage,
      languages,
      seed: pickSeed(botConfig)
    }

    const modelService = new ModelEntryService(this._modelStateRepo)
    const trainService = new TrainingEntryService(this._modelStateRepo)
    return new Bot(botDefinition, nluClient, this._defRepo, modelService, trainService, this._logger, this._webSocket)
  }
}
