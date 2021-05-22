import { ChannelSender } from '../../base/sender'
import { ChannelContext } from '../context'

export class TypingSender implements ChannelSender<any> {
  get priority(): number {
    return -1
  }

  handles(context: ChannelContext<any>): boolean {
    const typing = context.payload.typing
    return context.handlers > 0 && (typing === undefined || typing === true)
  }

  async send(context: ChannelContext<any>): Promise<void> {
    await this.sendIndicator(context)

    const delay = context.payload.delay ?? 1000
    await new Promise((resolve) => setTimeout(resolve, delay))
  }

  async sendIndicator(context: ChannelContext<any>): Promise<void> {}
}
