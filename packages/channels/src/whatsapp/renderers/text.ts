import { TextRenderer } from '../../base/renderers/text'
import { TextContent } from '../../content/types'
import { WhatsappContext } from '../context'

export class WhatsappTextRenderer extends TextRenderer {
  renderText(context: WhatsappContext, payload: TextContent): void {
    context.messages.push({
      type: 'text',
      text: {
        preview_url: false,
        body: payload.text
      }
    })
  }
}
