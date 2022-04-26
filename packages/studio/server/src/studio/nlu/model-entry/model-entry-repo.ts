/**
 * A bot can have up to one model and one training per language.
 * "ready" means the model is currently used for prediction.
 * "not-ready" means the model is currently being made.
 * */
type ModelStateStatus = 'ready' | 'not-ready'

interface ModelEntryPrimaryKey {
  botId: string
  language: string
  status: ModelStateStatus
}

interface ModelEntryRow extends ModelEntryPrimaryKey {
  modelId: string
  definitionHash: string
}

const getKey = (primaryKey: ModelEntryPrimaryKey) => `${primaryKey.botId}/${primaryKey.language}/${primaryKey.status}`

// TODO: Keep this in a file for restarts... right now restarting Botpress marks the model as dirty automatically
export class ModelEntryRepository {
  private state: { [key: string]: ModelEntryRow } = {}

  constructor() {}

  public async get(key: ModelEntryPrimaryKey): Promise<ModelEntryRow | undefined> {
    return this.state[getKey(key)] ? { ...this.state[getKey(key)] } : undefined
  }

  public async set(model: ModelEntryRow) {
    return (this.state[getKey(model)] = { ...model })
  }

  public async has(key: ModelEntryPrimaryKey): Promise<boolean> {
    const x = await this.get(key)
    return !!x
  }

  public async del(key: ModelEntryPrimaryKey): Promise<void> {
    delete this.state[getKey(key)]
  }
}
