import { TextRenderer } from '../../base/renderers/text'
import { TextContent } from '../../content/types'
import { VonageContext } from '../context'

export class VonageTextRenderer extends TextRenderer {
  renderText(context: VonageContext, payload: TextContent): void {
    context.messages.push({ message_type: 'text', text: payload.text })
  }
}
