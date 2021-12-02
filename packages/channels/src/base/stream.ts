import { ChannelService } from './service'

export class ChannelStream<TService extends ChannelService<any, any>> {
  constructor(protected readonly service: TService) {}

  async setup() {}
}
