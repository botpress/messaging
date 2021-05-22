import { TextContent } from '../../../content/types'
import { ChannelRenderer } from '../../base/renderer'
import { SmoochContext } from '../context'

export class SmoochTextRenderer implements ChannelRenderer<SmoochContext> {
  get priority(): number {
    return 0
  }

  handles(context: SmoochContext): boolean {
    return !!context.payload.text
  }

  async render(context: SmoochContext) {
    const payload = context.payload as TextContent

    context.messages.push({ type: 'text', text: payload.text })
  }
}
