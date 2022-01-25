import _ from 'lodash'
import { ChannelContext } from '../base/context'
import { ChannelStream } from '../base/stream'
import { TelegramContext } from './context'
import { TelegramService } from './service'

export class TelegramStream extends ChannelStream<TelegramService, TelegramContext> {
  get renderers() {
    return []
  }

  get senders() {
    return []
  }

  protected async getContext(base: ChannelContext<any>): Promise<TelegramContext> {
    return {
      ...base
    }
  }
}
