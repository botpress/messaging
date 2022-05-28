import { Service } from '@botpress/framework'
import { FileService } from '../files/service'
import { BaseHints } from './base-hints'

export class HintService extends Service {
  constructor(private files: FileService) {
    super()
  }

  async setup() {}

  async get() {
    // TODO: this is incomplete
    return { inputs: BaseHints }
  }
}
