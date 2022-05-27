import { VideoContent } from '@botpress/messaging-content'
import { VideoRenderer } from '../../base/renderers/video'
import { VonageContext } from '../context'

export class VonageVideoRenderer extends VideoRenderer {
  renderVideo(context: VonageContext, payload: VideoContent) {
    context.messages.push({ message_type: 'video', video: { url: payload.video, caption: payload.title } })
  }
}
