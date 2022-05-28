import { ApiManagers } from '@botpress/framework'
import { App } from './app'
import { FlowApi } from './flows/api'

export class Api {
  private flows: FlowApi

  constructor(private app: App, private managers: ApiManagers) {
    this.flows = new FlowApi(this.app.flows)
  }

  async setup() {
    this.flows.setup(this.managers.public)
  }
}
