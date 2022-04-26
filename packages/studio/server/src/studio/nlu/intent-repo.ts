import * as sdk from 'botpress/sdk'

import _ from 'lodash'
import path from 'path'

import { sanitizeFileName } from '../../common/utils'
import { Instance } from '../../studio/utils/bpfs'
import { NLUService } from './nlu-service'

const INTENTS_DIR = './intents'

export const trimUtterances = (intent: sdk.NLU.IntentDefinition) => {
  for (const lang of Object.keys(intent.utterances)) {
    intent.utterances[lang] = intent.utterances[lang].map((u) => u.trim())
  }
}

export class IntentRepository {
  constructor(private nluService: NLUService) {}

  private async intentExists(botId: string, intentName: string): Promise<boolean> {
    return Instance.fileExists(path.join(INTENTS_DIR, `${intentName}.json`))
  }

  public async getIntents(botId: string): Promise<sdk.NLU.IntentDefinition[]> {
    const intentNames = await Instance.directoryListing(INTENTS_DIR, {})
    return Promise.map(intentNames, (n) => this.getIntent(botId, n))
  }

  public async getIntent(botId: string, intentName: string): Promise<sdk.NLU.IntentDefinition> {
    intentName = sanitizeFileName(intentName)
    if (intentName.length < 1) {
      throw new Error('Invalid intent name, expected at least one character')
    }

    if (!(await this.intentExists(botId, intentName))) {
      throw new Error('Intent does not exist')
    }
    const buffer = await Instance.readFile(path.join(INTENTS_DIR, `${intentName}.json`))
    return JSON.parse(buffer.toString())
  }

  public async saveIntent(botId: string, intent: sdk.NLU.IntentDefinition): Promise<sdk.NLU.IntentDefinition> {
    const name = sanitizeFileName(intent.name)
    if (name.length < 1) {
      throw new Error('Invalid intent name, expected at least one character')
    }

    const availableEntities = await this.nluService.entities.listEntities(botId)

    _.chain(intent.slots)
      .flatMap('entities')
      .uniq()
      .forEach((entity) => {
        if (!availableEntities.find((e) => e.name === entity)) {
          throw Error(`"${entity}" is neither a system entity nor a custom entity`)
        }
      })

    trimUtterances(intent)

    await Instance.upsertFile(path.join(INTENTS_DIR, `${name}.json`), JSON.stringify(intent, undefined, 2))
    return intent
  }

  public async updateIntent(
    botId: string,
    name: string,
    content: Partial<sdk.NLU.IntentDefinition>
  ): Promise<sdk.NLU.IntentDefinition> {
    const intentDef = await this.getIntent(botId, name)
    const merged = _.merge(intentDef, content) as sdk.NLU.IntentDefinition
    if (content?.name !== name) {
      await this.deleteIntent(botId, name)
      name = <string>content.name
    }
    return this.saveIntent(botId, merged)
  }

  public async deleteIntent(botId: string, intentName: string): Promise<void> {
    intentName = sanitizeFileName(intentName)

    if (!(await this.intentExists(botId, intentName))) {
      throw new Error('Intent does not exist')
    }

    return Instance.deleteFile(path.join(INTENTS_DIR, `${intentName}.json`))
  }

  // ideally this would be a filewatcher
  public async updateIntentsSlotsEntities(botId: string, prevEntityName: string, newEntityName: string): Promise<void> {
    _.each(await this.getIntents(botId), async (intent) => {
      let modified = false
      _.each(intent.slots, (slot) => {
        _.forEach(slot.entities, (e, index, arr) => {
          if (e === prevEntityName) {
            arr[index] = newEntityName
            modified = true
          }
        })
      })
      if (modified) {
        await this.updateIntent(botId, intent.name, intent)
      }
    })
  }
}
