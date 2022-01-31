import { VideoRenderer } from '../../base/renderers/video'
import { VideoContent } from '../../content/types'
import { SlackContext } from '../context'

export class SlackVideoRenderer extends VideoRenderer {
  renderVideo(context: SlackContext, payload: VideoContent) {
    context.message.blocks.push({
      type: 'section',
      text: { type: 'mrkdwn', text: `<${payload.video}|${payload.title || payload.video}>` }
    })

    context.message.text = payload.title || payload.video
  }
}
