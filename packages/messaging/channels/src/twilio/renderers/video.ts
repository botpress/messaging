import { VideoContent } from '@botpress/messaging-content'
import { VideoRenderer } from '../../base/renderers/video'
import { TwilioContext } from '../context'

export class TwilioVideoRenderer extends VideoRenderer {
  renderVideo(context: TwilioContext, payload: VideoContent) {
    context.messages.push({ body: `${payload.title ? `${payload.title}\n` : payload.title}${payload.video}` })
  }
}
