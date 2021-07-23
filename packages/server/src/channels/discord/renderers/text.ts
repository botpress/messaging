import { TextContent } from '../../../content/types'
import { TextRenderer } from '../../base/renderers/text'
import { DiscordContext } from '../context'

export class DiscordTextRenderer extends TextRenderer {
  renderText(context: DiscordContext, payload: TextContent): void {
    context.messages.push({ content: payload.text })
  }
}
