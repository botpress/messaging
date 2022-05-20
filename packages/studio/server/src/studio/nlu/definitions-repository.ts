import * as sdk from '@botpress/sdk'
import { Instance } from '../utils/bpfs'

import { EntityRepository } from './entities-repo'
import { IntentRepository } from './intent-repo'

type FileListener = (fileName: string) => Promise<void>
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

  public onFileChanged(listener: FileListener): sdk.ListenHandle {
    const handle = Instance.onFileChanged(listener)
    return handle
  }
}
