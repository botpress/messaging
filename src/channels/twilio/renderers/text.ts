import { TextContent } from '../../../content/types'
import { ChannelRenderer } from '../../base/renderer'
import { TwilioContext } from '../context'

export class TwilioTextRenderer implements ChannelRenderer<TwilioContext> {
  get priority(): number {
    return 0
  }

  handles(context: TwilioContext): boolean {
    return context.payload.text
  }

  async render(context: TwilioContext) {
    const payload = context.payload as TextContent

    context.messages.push({ body: payload.text as string })
  }
}
