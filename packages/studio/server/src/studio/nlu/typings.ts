import { Training as BpTraining } from '@botpress/common'
import { BotConfig } from '@botpress/sdk'

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
