import { TextContent } from '../../../content/types'
import { ChannelRenderer } from '../../base/renderer'
import { SlackContext } from '../context'

export class SlackTextRenderer implements ChannelRenderer<SlackContext> {
  get priority(): number {
    return 0
  }

  handles(context: SlackContext): boolean {
    return !!context.payload.text
  }

  render(context: SlackContext) {
    const payload = context.payload as TextContent

    context.message.text = payload.text as string
  }
}
