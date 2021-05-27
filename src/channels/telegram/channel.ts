import { Channel } from '../base/channel'
import { TelegramInstance } from './instance'

export class TelegramChannel extends Channel<TelegramInstance> {
  get name() {
    return 'telegram'
  }

  get id() {
    return '0198f4f5-6100-4549-92e5-da6cc31b4ad1'
  }

  protected createInstance(providerName: string, clientId: string): TelegramInstance {
    return new TelegramInstance(
      this,
      providerName,
      clientId,
      this.kvs,
      this.conversations,
      this.messages,
      this.mapping,
      this.loggers
    )
  }

  async setupRoutes() {
    this.router.use('/', (req, res) => {
      const instance = res.locals.instance as TelegramInstance
      instance.callback(req, res)
    })

    this.printWebhook()
  }
}
