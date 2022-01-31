import { ChannelContext } from '../base/context'
import { CardToCarouselRenderer } from '../base/renderers/card'
import { ChannelSender } from '../base/sender'
import { TypingSender } from '../base/senders/typing'
import { ChannelStream } from '../base/stream'
import { SlackContext } from './context'
import { SlackRenderers } from './renderers'
import { SlackSenders } from './senders'
import { SlackService } from './service'

export class SlackStream extends ChannelStream<SlackService, SlackContext> {
  get renderers() {
    return [new CardToCarouselRenderer(), ...SlackRenderers]
  }

  get senders(): ChannelSender<ChannelContext<any>>[] {
    return [new TypingSender(), ...SlackSenders]
  }

  protected async getContext(base: ChannelContext<any>): Promise<SlackContext> {
    return {
      ...base,
      message: { channel: base.thread, blocks: [] }
    }
  }
}
