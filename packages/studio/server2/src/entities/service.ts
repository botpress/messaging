import { Service } from '@botpress/framework'
import { FileService } from '../files/service'

export class EntityService extends Service {
  constructor(private files: FileService) {
    super()
  }

  async setup() {}

  async create(entity: any) {
    await this.files.update(`entities/${entity.name}.json`, entity)
  }

  async list() {
    return [...this.listSystemEntities(), ...(await this.listCustomEntities())]
  }

  async listCustomEntities() {
    const entities = await this.files.list('entities')
    return entities.map((x) => this.addLabel(x.content))
  }

  listSystemEntities() {
    return [
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
      'volume',
      'any'
    ].map((x) => this.addLabel({ name: x, type: 'system', id: x }))
  }

  private addLabel(x: any) {
    return { ...x, label: `${x.type}.${x.name}` }
  }
}
