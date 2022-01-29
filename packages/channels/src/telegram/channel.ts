import { ChannelTemplate } from '../base/channel'
import { TelegramApi } from './api'
import { TelegramConfig, TelegramConfigSchema } from './config'
import { TelegramService } from './service'
import { TelegramStream } from './stream'

export class TelegramChannel extends ChannelTemplate<TelegramConfig, TelegramService, TelegramApi, TelegramStream> {
  get meta() {
    return {
      id: 'e578723f-ab57-463c-bc13-b483db9bf547',
      name: 'telegram',
      version: '1.0.0',
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
