import { ChannelSender } from '../../base/sender'
import { ChannelContext } from '../context'

export class TypingSender implements ChannelSender<any> {
  get priority(): number {
    return -1
  }

  handles(context: ChannelContext<any>): boolean {
    const typing = context.payload.typing
    return context.handlers > 0 && typing === true
  }

  async send(context: ChannelContext<any>): Promise<void> {
    await this.sendIndicator(context)

    const delay = context.payload.delay ?? 1000
    await new Promise((resolve) => setTimeout(resolve, delay))

    await this.stopIndicator(context)
  }

  async sendIndicator(context: ChannelContext<any>): Promise<void> {}
  async stopIndicator(context: ChannelContext<any>): Promise<void> {}
}
