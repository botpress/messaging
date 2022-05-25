import { TextContent } from '@botpress/messaging-content'
import { TextRenderer } from '../../base/renderers/text'
import { TwilioContext } from '../context'

export class TwilioTextRenderer extends TextRenderer {
  renderText(context: TwilioContext, payload: TextContent) {
    context.messages.push({ body: payload.text })
  }
}
