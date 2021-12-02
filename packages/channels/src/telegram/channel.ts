import { Channel } from '../base/channel'
import { TelegramApi } from './api'
import { TelegramConfig } from './config'
import { TelegramService } from './service'
import { TelegramStream } from './stream'

export class TelegramChannel extends Channel<TelegramConfig, TelegramService, TelegramApi, TelegramStream> {
  constructor() {
    const service = new TelegramService()
    super(service, new TelegramApi(service), new TelegramStream(service))
  }
}
