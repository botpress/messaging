import { ChannelContext } from '../base/context'
import { CardToCarouselRenderer } from '../base/renderers/card'
import { DropdownToChoicesRenderer } from '../base/renderers/dropdown'
import { ChannelStream } from '../base/stream'
import { TelegramContext } from './context'
import { TelegramRenderers } from './renderers'
import { TelegramSenders } from './senders'
import { TelegramService } from './service'

export class TelegramStream extends ChannelStream<TelegramService, TelegramContext> {
  get renderers() {
    return [new CardToCarouselRenderer(), new DropdownToChoicesRenderer(), ...TelegramRenderers]
  }

  get senders() {
    return TelegramSenders
  }

  protected async getContext(base: ChannelContext<any>): Promise<TelegramContext> {
    return {
      ...base,
      messages: []
    }
  }
}
