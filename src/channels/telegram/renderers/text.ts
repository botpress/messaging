import { TextContent } from '../../../content/types'
import { ChannelRenderer } from '../../base/renderer'
import { TelegramContext } from '../context'

export class TelegramTextRenderer implements ChannelRenderer<TelegramContext> {
  get priority(): number {
    return 0
  }

  handles(context: TelegramContext): boolean {
    return !!context.payload.text
  }

  render(context: TelegramContext) {
    const payload = context.payload as TextContent

    context.messages.push({ text: payload.text as string, markdown: payload.markdown })
  }
}
