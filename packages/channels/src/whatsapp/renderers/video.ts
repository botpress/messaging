import { VideoRenderer } from '../../base/renderers/video'
import { VideoContent } from '../../content/types'
import { WhatsappContext } from '../context'

export class WhatsappVideoRenderer extends VideoRenderer {
  renderVideo(context: WhatsappContext, payload: VideoContent) {
    context.messages.push({
      type: 'video',
      video: {
        link: payload.video,
        caption: payload.title ? payload.title.substring(0, 1024) : ''
      }
    })
  }
}
