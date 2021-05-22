import { ImageContent } from '../../../content/types'
import { ImageRenderer } from '../../base/renderers/image'
import { formatUrl } from '../../url'
import { SmoochContext } from '../context'

export class SmoochImageRenderer extends ImageRenderer {
  renderImage(context: SmoochContext, payload: ImageContent): void {
    context.messages.push({ type: 'image', mediaUrl: formatUrl(context.botUrl, payload.image) })
  }
}
