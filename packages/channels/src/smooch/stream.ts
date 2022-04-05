import { ChannelTestError } from '../base/channel'
import { ChannelContext } from '../base/context'
import { CardToCarouselRenderer } from '../base/renderers/card'
import { DropdownToChoicesRenderer } from '../base/renderers/dropdown'
import { ChannelTestEvent } from '../base/service'
import { ChannelStream } from '../base/stream'
import { SmoochContext } from './context'
import { SmoochRenderers } from './renderers'
import { SmoochSenders } from './senders'
import { SmoochService } from './service'

export class SmoochStream extends ChannelStream<SmoochService, SmoochContext> {
  get renderers() {
    return [new CardToCarouselRenderer(), new DropdownToChoicesRenderer(), ...SmoochRenderers]
  }

  get senders() {
    return SmoochSenders
  }

  async setup() {
    await super.setup()
    this.service.on('test', this.handleTest.bind(this))
  }

  private async handleTest({ scope }: ChannelTestEvent) {
    const { smooch, config } = this.service.get(scope)

    try {
      await smooch.apps.getApp(config.appId)
    } catch {
      throw new ChannelTestError(
        'unable to reach smooch with the provided key id, key secret and app id combination',
        'smooch',
        'keySecret'
      )
    }
  }

  protected async getContext(base: ChannelContext<any>): Promise<SmoochContext> {
    return {
      ...base,
      messages: []
    }
  }
}
