import { Channel } from '../base/channel'
import { TelegramApi } from './api'
import { TelegramConfig, TelegramConfigSchema } from './config'
import { TelegramService } from './service'
import { TelegramStream } from './stream'

export class TelegramChannel extends Channel<TelegramConfig, TelegramService, TelegramApi, TelegramStream> {
  get meta() {
    return {
      id: '0198f4f5-6100-4549-92e5-da6cc31b4ad1',
      name: 'telegram',
      schema: TelegramConfigSchema,
      initiable: true,
      lazy: true
    }
  }

  constructor() {
    const service = new TelegramService()
    super(service, new TelegramApi(service), new TelegramStream(service))
  }
}
