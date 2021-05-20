import { TextContent } from '../../../content/types'
import { ChannelRenderer } from '../../base/renderer'
import { TeamsContext } from '../context'

export class TeamsTextRenderer implements ChannelRenderer<TeamsContext> {
  get priority(): number {
    return 0
  }

  handles(context: TeamsContext): boolean {
    return !!context.payload.text
  }

  render(context: TeamsContext) {
    const payload = context.payload as TextContent

    context.messages.push({ text: payload.text as string })
  }
}
