import { ApiManagers } from '@botpress/framework'
import { App } from './app'
import { EnvApi } from './env/api'
import { FlowApi } from './flows/api'

export class Api {
  private env: EnvApi
  private flows: FlowApi

  constructor(private app: App, private managers: ApiManagers) {
    this.env = new EnvApi()
    this.flows = new FlowApi(this.app.flows)
  }

  async setup() {
    this.env.setup(this.managers.public)
    this.flows.setup(this.managers.public)
  }
}
