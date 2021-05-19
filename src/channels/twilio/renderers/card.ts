import { CardContent } from '../../../content/types'
import { ChannelRenderer } from '../../base/renderer'
import { TwilioContext } from '../context'

export class TwilioCardRenderer implements ChannelRenderer<TwilioContext> {
  get priority(): number {
    return -1
  }

  handles(context: TwilioContext): boolean {
    return context.payload.type === 'card'
  }

  render(context: TwilioContext) {
    const payload = context.payload as CardContent

    // we convert our card to a carousel
    context.payload = {
      type: 'carousel',
      items: [payload]
    }
  }
}
