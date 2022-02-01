import { TextRenderer } from '../../base/renderers/text'
import { TextContent } from '../../content/types'
import { SmoochContext } from '../context'

export class SmoochTextRenderer extends TextRenderer {
  renderText(context: SmoochContext, payload: TextContent): void {}
}
