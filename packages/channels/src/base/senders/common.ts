import { ChannelSender } from '../../base/sender'
import { ChannelContext } from '../context'

export abstract class CommonSender implements ChannelSender<any> {
  get priority(): number {
    return 0
  }

  handles(context: ChannelContext<any>): boolean {
    return context.handlers > 0
  }

  async send(context: ChannelContext<any>) {}
}
