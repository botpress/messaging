import { Service } from '@botpress/framework'
import { FileService } from '../files/service'

export class IntentService extends Service {
  constructor(private files: FileService) {
    super()
  }

  async setup() {}

  async list() {
    const intents = await this.files.list('intents')
    return intents.map((x) => x.content)
  }
}
