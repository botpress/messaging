import { TextRenderer } from '../../base/renderers/text'
import { TextContent } from '../../content/types'
import { TwilioContext } from '../context'

export class TwilioTextRenderer extends TextRenderer {
  renderText(context: TwilioContext, payload: TextContent) {
    context.messages.push({ body: payload.text })
  }
}
