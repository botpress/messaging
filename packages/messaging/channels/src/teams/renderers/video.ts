import { VideoContent } from '@botpress/messaging-content'
import { VideoRenderer } from '../../base/renderers/video'
import { TeamsContext } from '../context'

export class TeamsVideoRenderer extends VideoRenderer {
  renderVideo(context: TeamsContext, payload: VideoContent) {
    context.messages.push({
      text: `${payload.title ? `${payload.title} ` : ''}${payload.video}`
    })
  }
}
