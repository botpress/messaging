import { ImageRenderer } from '../../base/renderers/image'
import { ImageContent } from '../../content/types'
import { SmoochContext } from '../context'

export class SmoochImageRenderer extends ImageRenderer {
  renderImage(context: SmoochContext, payload: ImageContent): void {
    context.messages.push({ type: 'image', mediaUrl: payload.image, text: payload.title })
  }
}
