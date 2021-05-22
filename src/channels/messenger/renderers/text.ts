import { TextContent } from '../../../content/types'
import { ChannelRenderer } from '../../base/renderer'
import { MessengerContext } from '../context'

export class MessengerTextRenderer implements ChannelRenderer<MessengerContext> {
  get priority(): number {
    return 0
  }

  get id(): string {
    return MessengerTextRenderer.name
  }

  handles(context: MessengerContext): boolean {
    return !!context.payload.text
  }

  async render(context: MessengerContext) {
    const payload = context.payload as TextContent

    context.messages.push({ text: payload.text })
  }
}
