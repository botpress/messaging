import { Service } from '@botpress/framework'
import { FileService } from '../files/service'

export class ConfigService extends Service {
  constructor(private files: FileService) {
    super()
  }

  async setup() {}

  async get() {
    return this.files.get('bot.config.json')
  }

  async update(config: any) {
    return this.files.update('bot.config.json', config)
  }
}
