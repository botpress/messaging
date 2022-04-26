import { BotConfig, ModuleDefinition } from 'botpress/sdk'
import { combineReducers } from 'redux'

import bot, { BotReducer } from './bot'
import bots, { BotsReducer } from './bots'
import content, { ContentReducer } from './content'
import flows, { FlowReducer } from './flows'
import hints from './hints'
import language, { LanguageReducer } from './language'
import modules from './modules'
import nlu, { NLUReducer } from './nlu'
import skills, { SkillsReducer } from './skills'
import ui, { UiReducer } from './ui'
import user, { UserReducer } from './user'
export * from './selectors'

const bpApp = combineReducers({
  bots,
  content,
  flows,
  ui,
  user,
  bot,
  modules,
  skills,
  language,
  hints,
  nlu
})
export default bpApp

export interface RootReducer {
  flows: FlowReducer
  user: UserReducer
  content: ContentReducer
  skills: SkillsReducer
  modules: ModuleDefinition[]
  ui: UiReducer
  bot: BotReducer
  bots: BotsReducer
  nlu: NLUReducer
  language: LanguageReducer
}
