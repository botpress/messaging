import { ImageRenderer } from '../../base/renderers/image'
import { ImageContent } from '../../content/types'
import { WhatsappContext } from '../context'

export class WhatsappImageRenderer extends ImageRenderer {
  renderImage(context: WhatsappContext, payload: ImageContent): void {
    context.messages.push({
      type: 'image',
      image: {
        link: payload.image,
        caption: payload.title ? payload.title.substring(0, 1024) : ''
      }
    })
  }
}
