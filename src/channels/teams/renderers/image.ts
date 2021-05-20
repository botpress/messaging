import { ActivityTypes } from 'botbuilder'
import { ImageContent } from '../../../content/types'
import { ChannelRenderer } from '../../base/renderer'
import { formatUrl } from '../../url'
import { TeamsContext } from '../context'

export class TeamsImageRenderer implements ChannelRenderer<TeamsContext> {
  get priority(): number {
    return 0
  }

  handles(context: TeamsContext): boolean {
    return !!context.payload.image
  }

  render(context: TeamsContext) {
    const payload = context.payload as ImageContent

    context.messages.push({
      type: ActivityTypes.Message,
      attachments: [
        {
          // TODO: this isn't working (no image caption)
          name: payload.title as string,
          contentType: 'image/png',
          contentUrl: formatUrl(context.botUrl, payload.image)
        }
      ]
    })
  }
}
