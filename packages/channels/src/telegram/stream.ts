import { ChannelTestError } from '..'
import { ChannelContext } from '../base/context'
import { CardToCarouselRenderer } from '../base/renderers/card'
import { DropdownToChoicesRenderer } from '../base/renderers/dropdown'
import { ChannelTestEvent } from '../base/service'
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

  async setup() {
    await super.setup()
    this.service.on('test', this.handleTest.bind(this))
  }

  private async handleTest({ scope }: ChannelTestEvent) {
    const { telegraf } = this.service.get(scope)

    try {
      await telegraf.telegram.getWebhookInfo()
    } catch {
      throw new ChannelTestError('unable to reach telegram with the provided bot token', 'telegram', 'botToken')
    }
  }

  protected async getContext(base: ChannelContext<any>): Promise<TelegramContext> {
    return {
      ...base,
      messages: []
    }
  }
}
