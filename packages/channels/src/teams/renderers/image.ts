import { ActivityTypes } from 'botbuilder'
import { ImageRenderer } from '../../base/renderers/image'
import { ImageContent } from '../../content/types'
import { TeamsContext } from '../context'

export class TeamsImageRenderer extends ImageRenderer {
  renderImage(context: TeamsContext, payload: ImageContent) {
    context.messages.push({
      type: ActivityTypes.Message,
      attachments: [
        {
          name: payload.title,
          contentType: 'image/png',
          contentUrl: payload.image
        }
      ]
    })

    if (payload.title) {
      context.messages.push({ text: payload.title })
    }
  }
}
