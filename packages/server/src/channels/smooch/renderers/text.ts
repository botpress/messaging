import removeMd from 'remove-markdown'
import { TextContent } from '../../../content/types'
import { TextRenderer } from '../../base/renderers/text'
import { SmoochContext } from '../context'

export class SmoochTextRenderer extends TextRenderer {
  renderText(context: SmoochContext, payload: TextContent): void {
    if (payload.markdown) {
      const cleanText = removeMd(payload.text)
      payload.text = String(cleanText)
    }

    context.messages.push({ type: 'text', text: payload.text })
  }
}
