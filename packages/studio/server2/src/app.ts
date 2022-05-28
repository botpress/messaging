import { Framework } from '@botpress/framework'
import { FileService } from './files/service'
import { FlowService } from './flows/service'
import { PathService } from './paths/service'

export class App extends Framework {
  paths: PathService
  files: FileService
  flows: FlowService

  constructor() {
    super()
    this.paths = new PathService()
    this.files = new FileService(this.paths)
    this.flows = new FlowService(this.files)
  }

  async setup() {
    await super.setup()
    await this.files.setup()
    await this.flows.setup()
  }
}
