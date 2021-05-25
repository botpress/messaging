import { TextContent } from '../../../content/types'
import { ChannelRenderer } from '../../base/renderer'
import { VonageContext } from '../context'

export class VonageTextRenderer implements ChannelRenderer<VonageContext> {
  get priority(): number {
    return 0
  }

  handles(context: VonageContext): boolean {
    return !!context.payload.text
  }

  async render(context: VonageContext) {
    const payload = context.payload as TextContent

    context.messages.push({ content: { type: 'text', text: payload.text as string } })
  }
}
