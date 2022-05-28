import { ApiManagers } from '@botpress/framework'
import { App } from './app'
import { ConfigApi } from './config/api'
import { EnvApi } from './env/api'
import { FlowApi } from './flows/api'
import { HintApi } from './hints/api'
import { NluApi } from './nlu/api'

export class Api {
  private env: EnvApi
  private config: ConfigApi
  private hints: HintApi
  private nlu: NluApi
  private flows: FlowApi

  constructor(private app: App, private managers: ApiManagers) {
    this.env = new EnvApi()
    this.config = new ConfigApi(this.app.config)
    this.hints = new HintApi(this.app.hints)
    this.nlu = new NluApi(this.app.nlu)
    this.flows = new FlowApi(this.app.flows)
  }

  async setup() {
    this.env.setup(this.managers.public)
    this.config.setup(this.managers.public)
    this.hints.setup(this.managers.public)
    this.nlu.setup(this.managers.public)
    this.flows.setup(this.managers.public)
  }
}
