import { Framework } from '@botpress/framework'
import { FileService } from './files/service'
import { FlowService } from './flows/service'

export class App extends Framework {
  files: FileService
  flows: FlowService

  constructor() {
    super()
    this.files = new FileService()
    this.flows = new FlowService(this.files)
  }

  async setup() {
    await super.setup()
    await this.files.setup()
    await this.flows.setup()
  }
}
