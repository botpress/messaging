import { ApiManagers } from '@botpress/framework'
import { ActionApi } from './actions/api'
import { App } from './app'
import { CmsApi } from './cms/api'
import { ConfigApi } from './config/api'
import { EditorApi } from './editor/api'
import { EntityApi } from './entities/api'
import { EnvApi } from './env/api'
import { FlowApi } from './flows/api'
import { HintApi } from './hints/api'
import { IntentApi } from './intents/api'
import { MediaApi } from './media/api'
import { NluApi } from './nlu/api'
import { QnaApi } from './qna/api'

export class Api {
  private env: EnvApi
  private config: ConfigApi
  private hints: HintApi
  private nlu: NluApi
  private intents: IntentApi
  private entities: EntityApi
  private flows: FlowApi
  private cms: CmsApi
  private qnas: QnaApi
  private editor: EditorApi
  private actions: ActionApi
  private media: MediaApi

  constructor(private app: App, private managers: ApiManagers) {
    this.env = new EnvApi()
    this.config = new ConfigApi(this.app.config)
    this.hints = new HintApi(this.app.hints)
    this.nlu = new NluApi(this.app.nlu)
    this.intents = new IntentApi(this.app.intents)
    this.entities = new EntityApi(this.app.entities)
    this.flows = new FlowApi(this.app.flows)
    this.cms = new CmsApi(this.app.cms)
    this.qnas = new QnaApi(this.app.qnas)
    this.editor = new EditorApi(this.app.editor)
    this.actions = new ActionApi(this.app.actions)
    this.media = new MediaApi(this.app.media)
  }

  async setup() {
    this.env.setup(this.managers.public)
    this.config.setup(this.managers.public)
    this.hints.setup(this.managers.public)
    this.nlu.setup(this.managers.public)
    this.intents.setup(this.managers.public)
    this.entities.setup(this.managers.public)
    this.flows.setup(this.managers.public)
    this.cms.setup(this.managers.public)
    this.qnas.setup(this.managers.public)
    this.editor.setup(this.managers.public)
    this.actions.setup(this.managers.public)
    this.media.setup(this.managers.public)
  }
}
