import { Framework } from '@botpress/framework'
import { ActionService } from './actions/service'
import { CmsService } from './cms/service'
import { ConfigService } from './config/service'
import { EditorService } from './editor/service'
import { EntityService } from './entities/service'
import { FileService } from './files/service'
import { FlowService } from './flows/service'
import { HintService } from './hints/service'
import { IntentService } from './intents/service'
import { MediaService } from './media/service'
import { NluService } from './nlu/service'
import { PathService } from './paths/service'
import { QnaService } from './qna/service'
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
  qnas: QnaService
  editor: EditorService
  actions: ActionService
  sockets: SocketService
  media: MediaService

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
    this.cms = new CmsService(this.paths, this.files)
    this.qnas = new QnaService(this.files)
    this.editor = new EditorService(this.paths)
    this.actions = new ActionService(this.paths)
    this.sockets = new SocketService()
    this.media = new MediaService(this.paths)
  }

  async setup() {
    await super.setup()
    await this.paths.setup()
    await this.files.setup()
    await this.config.setup()
    await this.hints.setup()
    await this.nlu.setup()
    await this.intents.setup()
    await this.entities.setup()
    await this.flows.setup()
    await this.cms.setup()
    await this.qnas.setup()
    await this.editor.setup()
    await this.actions.setup()
    await this.sockets.setup()
    await this.media.setup()
  }
}
