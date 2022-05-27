import { ImageContent } from '@botpress/messaging-content'
import { ImageRenderer } from '../../base/renderers/image'
import { TwilioContext } from '../context'

export class TwilioImageRenderer extends ImageRenderer {
  renderImage(context: TwilioContext, payload: ImageContent) {
    context.messages.push({ body: payload.title, mediaUrl: payload.image })
  }
}
