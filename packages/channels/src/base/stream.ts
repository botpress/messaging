import { ChannelSendEvent, ChannelService } from './service'

export abstract class ChannelStream<TService extends ChannelService<any, any>> {
  constructor(protected readonly service: TService) {}

  async setup() {
    this.service.on('send', this.handleSend.bind(this))
  }

  protected abstract handleSend({ scope, endpoint, content }: ChannelSendEvent): Promise<void>
}
