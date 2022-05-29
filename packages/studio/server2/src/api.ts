import { ApiManagers } from '@botpress/framework'
import { App } from './app'
import { CmsApi } from './cms/api'
import { ConfigApi } from './config/api'
import { EntityApi } from './entities/api'
import { EnvApi } from './env/api'
import { FlowApi } from './flows/api'
import { HintApi } from './hints/api'
import { IntentApi } from './intents/api'
import { NluApi } from './nlu/api'

export class Api {
  private env: EnvApi
  private config: ConfigApi
  private hints: HintApi
  private nlu: NluApi
  private intents: IntentApi
  private entities: EntityApi
  private flows: FlowApi
  private cms: CmsApi

  constructor(private app: App, private managers: ApiManagers) {
    this.env = new EnvApi()
    this.config = new ConfigApi(this.app.config)
    this.hints = new HintApi(this.app.hints)
    this.nlu = new NluApi(this.app.nlu)
    this.intents = new IntentApi(this.app.intents)
    this.entities = new EntityApi(this.app.entities)
    this.flows = new FlowApi(this.app.flows)
    this.cms = new CmsApi(this.app.cms)
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
  }
}
