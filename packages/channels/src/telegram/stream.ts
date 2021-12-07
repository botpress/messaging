import _ from 'lodash'
import { ChannelContext } from '../base/context'
import { ChannelRenderer } from '../base/renderer'
import { CardToCarouselRenderer } from '../base/renderers/card'
import { DropdownToChoicesRenderer } from '../base/renderers/dropdown'
import { ChannelSender } from '../base/sender'
import { ChannelSendEvent } from '../base/service'
import { ChannelStream } from '../base/stream'
import { TelegramContext } from './context'
import { TelegramRenderers } from './renderers'
import { TelegramSenders } from './senders'
import { TelegramService } from './service'

export class TelegramStream extends ChannelStream<TelegramService> {
  protected renderers: ChannelRenderer<ChannelContext<any>>[] = [
    new CardToCarouselRenderer(),
    new DropdownToChoicesRenderer(),
    ...TelegramRenderers
  ]
  protected senders: ChannelSender<ChannelContext<any>>[] = TelegramSenders

  protected async handleSend({ scope, endpoint, content }: ChannelSendEvent) {
    const context = await this.getContext({
      state: this.service.get(scope),
      handlers: 0,
      payload: _.cloneDeep(content),
      ...endpoint
    })

    for (const renderer of this.renderers) {
      if (renderer.handles(context)) {
        try {
          renderer.render(context)
        } catch (e) {
          console.error('Error occurred when rendering a message', e)
        } finally {
          context.handlers++
        }
      }
    }

    for (const sender of this.senders) {
      if (sender.handles(context)) {
        try {
          await sender.send(context)
        } catch (e) {
          console.error('Error occurred when sending a message', e)
        }
      }
    }
  }

  protected async getContext(base: ChannelContext<any>): Promise<TelegramContext> {
    return {
      ...base,
      messages: []
    }
  }
}
