import { ImageRenderer } from '../../base/renderers/image'
import { ImageContent } from '../../content/types'
import { TwilioContext } from '../context'

export class TwilioImageRenderer extends ImageRenderer {
  renderImage(context: TwilioContext, payload: ImageContent) {
    // TODO fix mediaUrl not being in typings
    context.messages.push(<any>{ body: payload.title, mediaUrl: payload.image })
  }
}
