import { Service } from '@botpress/framework'
import { FileService } from '../files/service'
import { Flow } from './types'

export class FlowService extends Service {
  constructor(private files: FileService) {
    super()
  }

  async setup() {}

  async list(): Promise<Flow[]> {
    return this.files.list('flows')
  }
}
