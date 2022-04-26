import * as sdk from 'botpress/sdk'

import { EntityRepository } from './entities-repo'
import { IntentRepository } from './intent-repo'

interface TrainDefinitions {
  intentDefs: sdk.NLU.IntentDefinition[]
  entityDefs: sdk.NLU.EntityDefinition[]
}

export class DefinitionsRepository {
  constructor(private entityRepo: EntityRepository, private intentRepo: IntentRepository) {}

  public async getTrainDefinitions(botId: string): Promise<TrainDefinitions> {
    const intentDefs = await this.intentRepo.getIntents(botId)
    const entityDefs = await this.entityRepo.listEntities(botId)

    return {
      intentDefs,
      entityDefs
    }
  }
}
