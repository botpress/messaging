import * as sdk from 'botpress/sdk'
import path from 'path'
import { getEntityId } from '../../common/entity-id'
import { sanitizeFileName } from '../../common/utils'
import { Instance } from '../../studio/utils/bpfs'

import { NLUService } from './nlu-service'

const ENTITIES_DIR = './entities'

// copied from botpress/nlu repo
const SYSTEM_ENTITIES = [
  'amountOfMoney',
  'distance',
  'duration',
  'email',
  'number',
  'ordinal',
  'phoneNumber',
  'quantity',
  'temperature',
  'time',
  'url',
  'volume'
]

const getSystemEntities = (): sdk.NLU.EntityDefinition[] => {
  return [...SYSTEM_ENTITIES, 'any'].map((name) => {
    const entityDef: sdk.NLU.EntityDefinition = { name, type: 'system', id: getEntityId(name) }
    return entityDef
  })
}

export class EntityRepository {
  constructor(private nluService: NLUService) {}

  private entityExists(botId: string, entityName: string): Promise<boolean> {
    return Instance.fileExists(path.join(ENTITIES_DIR, `${entityName}.json`))
  }

  public async getCustomEntities(botId: string): Promise<sdk.NLU.EntityDefinition[]> {
    const intentNames = await Instance.directoryListing(ENTITIES_DIR, {})
    return Promise.mapSeries(intentNames, (n) => this.getEntity(botId, n))
  }

  public async listEntities(botId: string): Promise<sdk.NLU.EntityDefinition[]> {
    return [...getSystemEntities(), ...(await this.getCustomEntities(botId))]
  }

  public async getEntity(botId: string, entityName: string): Promise<sdk.NLU.EntityDefinition> {
    entityName = sanitizeFileName(entityName)

    if (!(await this.entityExists(botId, entityName))) {
      throw new Error('Entity does not exist')
    }
    const buffer = await Instance.readFile(path.join(ENTITIES_DIR, `${entityName}.json`))
    return JSON.parse(buffer.toString())
  }

  public async deleteEntity(botId: string, entityName: string): Promise<void> {
    const nameSanitized = sanitizeFileName(entityName)
    if (!(await this.entityExists(botId, nameSanitized))) {
      throw new Error('Entity does not exist')
    }

    return Instance.deleteFile(path.join(ENTITIES_DIR, `${nameSanitized}.json`))
  }

  public async saveEntity(botId: string, entity: sdk.NLU.EntityDefinition): Promise<void> {
    const nameSanitized = sanitizeFileName(entity.name)
    return Instance.upsertFile(path.join(ENTITIES_DIR, `${nameSanitized}.json`), JSON.stringify(entity, undefined, 2))
  }

  public async updateEntity(botId: string, targetEntityName: string, entity: sdk.NLU.EntityDefinition): Promise<void> {
    const nameSanitized = sanitizeFileName(entity.name)
    const targetSanitized = sanitizeFileName(targetEntityName)

    if (targetSanitized !== nameSanitized) {
      // entity renamed
      await Promise.all([
        this.deleteEntity(botId, targetSanitized),
        this.nluService.intents.updateIntentsSlotsEntities(botId, targetSanitized, nameSanitized)
      ])
    } else {
      // entity changed
    }
    await this.saveEntity(botId, entity)
  }
}
