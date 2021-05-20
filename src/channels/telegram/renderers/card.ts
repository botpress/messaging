import { CardContent } from '../../../content/types'
import { ChannelRenderer } from '../../base/renderer'
import { TelegramContext } from '../context'

export class TelegramCardRenderer implements ChannelRenderer<TelegramContext> {
  get priority(): number {
    return -1
  }

  handles(context: TelegramContext): boolean {
    return context.payload.type === 'card'
  }

  render(context: TelegramContext) {
    const payload = context.payload as CardContent

    // we convert our card to a carousel
    context.payload = context.payload = {
      type: 'carousel',
      items: [payload]
    }
  }
}
