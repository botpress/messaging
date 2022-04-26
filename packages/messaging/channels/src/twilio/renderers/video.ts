import { VideoRenderer } from '../../base/renderers/video'
import { VideoContent } from '../../content/types'
import { TwilioContext } from '../context'

export class TwilioVideoRenderer extends VideoRenderer {
  renderVideo(context: TwilioContext, payload: VideoContent) {
    context.messages.push({ body: `${payload.title ? `${payload.title}\n` : payload.title}${payload.video}` })
  }
}
