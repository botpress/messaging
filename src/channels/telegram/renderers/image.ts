import { ImageContent } from '../../../content/types'
import { ChannelRenderer } from '../../base/renderer'
import { formatUrl } from '../../url'
import { TelegramContext } from '../context'

export class TelegramImageRenderer implements ChannelRenderer<TelegramContext> {
  get priority(): number {
    return 0
  }

  handles(context: TelegramContext): boolean {
    return !!context.payload.image
  }

  render(context: TelegramContext) {
    const { messages } = context
    const payload = context.payload as ImageContent

    if (payload.image.toLowerCase().endsWith('.gif')) {
      messages.push({ animation: formatUrl(context.botUrl, payload.image) })
    } else {
      messages.push({ photo: formatUrl(context.botUrl, payload.image) })
    }
  }
}
