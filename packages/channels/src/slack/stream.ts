import { ChannelTestError } from '..'
import { ChannelContext } from '../base/context'
import { CardToCarouselRenderer } from '../base/renderers/card'
import { ChannelSender } from '../base/sender'
import { TypingSender } from '../base/senders/typing'
import { ChannelTestEvent } from '../base/service'
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

  async setup() {
    await super.setup()
    this.service.on('test', this.handleTest.bind(this))
  }

  private async handleTest({ scope }: ChannelTestEvent) {
    const { app, config } = this.service.get(scope)

    try {
      await app.client.auth.test()
    } catch {
      throw new ChannelTestError(
        'unable to authenticate slack request with the provided bot token',
        'slack',
        'botToken'
      )
    }
  }

  protected async getContext(base: ChannelContext<any>): Promise<SlackContext> {
    return {
      ...base,
      message: { channel: base.thread, blocks: [] }
    }
  }
}
