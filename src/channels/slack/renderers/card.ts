import { CardContent } from '../../../content/types'
import { ChannelRenderer } from '../../base/renderer'
import { SlackContext } from '../context'

export class SlackCardRenderer implements ChannelRenderer<SlackContext> {
  get priority(): number {
    return -1
  }

  handles(context: SlackContext): boolean {
    return context.payload.type === 'card'
  }

  render(context: SlackContext) {
    const payload = context.payload as CardContent

    // we convert our card to a carousel
    context.payload = context.payload = {
      type: 'carousel',
      items: [payload]
    }
  }
}
