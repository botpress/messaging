import { VideoContent } from '@botpress/messaging-content'
import { VideoRenderer } from '../../base/renderers/video'
import { SmoochContext } from '../context'

export class SmoochVideoRenderer extends VideoRenderer {
  renderVideo(context: SmoochContext, payload: VideoContent) {
    context.messages.push({ type: 'file', text: payload.title, mediaUrl: payload.video })
  }
}
