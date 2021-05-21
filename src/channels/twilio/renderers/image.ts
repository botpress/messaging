import { ImageContent } from '../../../content/types'
import { ImageRenderer } from '../../base/renderers/image'
import { TwilioContext } from '../context'

export class TwilioImageRenderer extends ImageRenderer {
  renderImage(context: TwilioContext, payload: ImageContent) {
    // TODO fix mediaUrl not being in typings
    context.messages.push(<any>{ body: payload.title, mediaUrl: payload.image })
  }
}
