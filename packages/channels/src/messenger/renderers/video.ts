import { VideoRenderer } from '../../base/renderers/video'
import { VideoContent } from '../../content/types'
import { MessengerContext } from '../context'

export class MessengerVideoRenderer extends VideoRenderer {
  renderVideo(context: MessengerContext, payload: VideoContent) {
    context.messages.push({
      attachment: {
        type: 'video',
        payload: {
          is_reusable: true,
          url: payload.video
        }
      }
    })

    if (payload.title?.length) {
      context.messages.push({ text: payload.title })
    }
  }
}
