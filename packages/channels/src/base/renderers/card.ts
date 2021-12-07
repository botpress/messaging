import { ChannelRenderer } from '../../base/renderer'
import { CardContent } from '../../content/types'
import { ChannelContext } from '../context'

export class CardToCarouselRenderer implements ChannelRenderer<ChannelContext<any>> {
  get priority(): number {
    return -1
  }

  handles(context: ChannelContext<any>): boolean {
    return context.payload.type === 'card'
  }

  render(context: ChannelContext<any>) {
    const payload = context.payload as CardContent

    // we convert our card to a carousel
    context.payload = context.payload = {
      type: 'carousel',
      items: [payload]
    }
  }
}
