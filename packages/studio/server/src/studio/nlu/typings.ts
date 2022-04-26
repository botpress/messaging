import { CloudConfig } from 'botpress/sdk'
import { Training as BpTraining } from '../../common/nlu-training'

export interface BotConfig {
  id: string
  defaultLanguage: string
  languages: string[]
  nluSeed?: number
  nluModels?: { [lang: string]: string }
  cloud?: CloudConfig
}

export interface BotDefinition {
  botId: string
  defaultLanguage: string
  languages: string[]
  seed: number
}

export interface ConfigResolver {
  getBotById(botId: string): Promise<BotConfig | undefined>
  mergeBotConfig(botId: string, partialConfig: Partial<BotConfig>, ignoreLock?: boolean): Promise<any>
}

export type TrainListener = (training: BpTraining) => void
