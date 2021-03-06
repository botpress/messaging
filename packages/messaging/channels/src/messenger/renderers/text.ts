import { TextContent } from '@botpress/messaging-content'
import { TextRenderer } from '../../base/renderers/text'
import { MessengerContext } from '../context'

export class MessengerTextRenderer extends TextRenderer {
  renderText(context: MessengerContext, payload: TextContent): void {
    context.messages.push({ text: payload.text })
  }
}
