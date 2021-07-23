import { ActivityTypes } from 'botbuilder'
import { ImageContent } from '../../../content/types'
import { ImageRenderer } from '../../base/renderers/image'
import { TeamsContext } from '../context'

export class TeamsImageRenderer extends ImageRenderer {
  renderImage(context: TeamsContext, payload: ImageContent) {
    context.messages.push({
      type: ActivityTypes.Message,
      attachments: [
        {
          // TODO: this isn't working (no image caption)
          name: payload.title,
          contentType: 'image/png',
          contentUrl: payload.image
        }
      ]
    })
  }
}
