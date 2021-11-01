import removeMd from 'remove-markdown'
import { TextContent } from '../../../content/types'
import { TextRenderer } from '../../base/renderers/text'
import { SmoochContext } from '../context'

export class SmoochTextRenderer extends TextRenderer {
  renderText(context: SmoochContext, payload: TextContent): void {
    let text = payload.text

    if (payload.markdown) {
      text = removeMd(text)
    }

    context.messages.push({ type: 'text', text: payload.text })
  }
}
