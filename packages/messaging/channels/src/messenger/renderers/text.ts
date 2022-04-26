import { TextRenderer } from '../../base/renderers/text'
import { TextContent } from '../../content/types'
import { MessengerContext } from '../context'

export class MessengerTextRenderer extends TextRenderer {
  renderText(context: MessengerContext, payload: TextContent): void {
    context.messages.push({ text: payload.text })
  }
}
