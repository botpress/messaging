import { remark } from 'remark'
import strip from 'strip-markdown'
import { TextContent } from '../../../content/types'
import { TextRenderer } from '../../base/renderers/text'
import { SmoochContext } from '../context'

export class SmoochTextRenderer extends TextRenderer {
  renderText(context: SmoochContext, payload: TextContent): void {
    if (payload.markdown) {
      const cleanText = remark().use(strip).processSync(payload.text)
      payload.text = String(cleanText)
    }

    context.messages.push({ type: 'text', text: payload.text })
  }
}
