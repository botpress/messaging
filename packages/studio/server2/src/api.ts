import { ApiManager } from '@botpress/framework'
import { App } from './app'

export class Api {
  constructor(private app: App, private manager: ApiManager) {}

  async setup() {}
}
