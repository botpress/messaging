import type { Express } from 'express'
import { App } from './app'

export class Interceptor {
  constructor(private app: App, private express: Express) {}

  async setup() {
    this.app.metrics.init(this.express)
  }
}
