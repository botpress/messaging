import { ChannelSender } from '../../base/sender'
import { VonageContext } from '../context'

export class VonageTypingSender implements ChannelSender<VonageContext> {
  get priority(): number {
    return -1
  }

  handles(context: VonageContext): boolean {
    const typing = context.payload.typing
    return context.handlers > 0 && (typing === undefined || typing === true)
  }

  async send(context: VonageContext) {
    const delay = context.payload.delay ?? 1000

    // TODO: reimpl
    // await Promise.delay(delay)
  }
}
