import { Service } from '@botpress/messaging-engine'
import { Logger } from './types'

export class LoggerService extends Service {
  root: Logger

  constructor() {
    super()

    this.root = new Logger('app')
  }

  async setup() {}
}
