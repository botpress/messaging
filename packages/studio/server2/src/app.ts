import { Framework } from '@botpress/framework'
import { CmsService } from './cms/service'
import { ConfigService } from './config/service'
import { EntityService } from './entities/service'
import { FileService } from './files/service'
import { FlowService } from './flows/service'
import { HintService } from './hints/service'
import { IntentService } from './intents/service'
import { NluService } from './nlu/service'
import { PathService } from './paths/service'
import { SocketService } from './socket/service'

export class App extends Framework {
  paths: PathService
  files: FileService
  config: ConfigService
  hints: HintService
  nlu: NluService
  intents: IntentService
  entities: EntityService
  flows: FlowService
  cms: CmsService
  sockets: SocketService

  constructor() {
    super()
    this.paths = new PathService()
    this.files = new FileService(this.paths)
    this.config = new ConfigService(this.files)
    this.hints = new HintService(this.files)
    this.nlu = new NluService()
    this.intents = new IntentService(this.files)
    this.entities = new EntityService(this.files)
    this.flows = new FlowService(this.paths, this.files)
    this.cms = new CmsService(this.paths)
    this.sockets = new SocketService()
  }

  async setup() {
    await super.setup()
    await this.files.setup()
    await this.config.setup()
    await this.hints.setup()
    await this.nlu.setup()
    await this.intents.setup()
    await this.entities.setup()
    await this.flows.setup()
    await this.cms.setup()
    await this.sockets.setup()
  }
}
