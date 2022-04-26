import { ImageRenderer } from '../../base/renderers/image'
import { ImageContent } from '../../content/types'
import { TwilioContext } from '../context'

export class TwilioImageRenderer extends ImageRenderer {
  renderImage(context: TwilioContext, payload: ImageContent) {
    context.messages.push({ body: payload.title, mediaUrl: payload.image })
  }
}
