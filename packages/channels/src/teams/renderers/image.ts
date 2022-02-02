import { ActivityTypes, CardFactory } from 'botbuilder'
import { ImageRenderer } from '../../base/renderers/image'
import { ImageContent } from '../../content/types'
import { TeamsContext } from '../context'

export class TeamsImageRenderer extends ImageRenderer {
  renderImage(context: TeamsContext, payload: ImageContent) {
    context.messages.push({
      type: ActivityTypes.Message,
      attachments: [CardFactory.heroCard(payload.title!, CardFactory.images([payload.image]))]
    })
  }
}
