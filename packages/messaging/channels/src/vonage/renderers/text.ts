import { TextContent } from '@botpress/messaging-content'
import { TextRenderer } from '../../base/renderers/text'
import { VonageContext } from '../context'

export class VonageTextRenderer extends TextRenderer {
  renderText(context: VonageContext, payload: TextContent): void {
    context.messages.push({ message_type: 'text', text: payload.text })
  }
}
