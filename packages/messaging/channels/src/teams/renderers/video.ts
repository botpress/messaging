import { VideoRenderer } from '../../base/renderers/video'
import { VideoContent } from '../../content/types'
import { TeamsContext } from '../context'

export class TeamsVideoRenderer extends VideoRenderer {
  renderVideo(context: TeamsContext, payload: VideoContent) {
    context.messages.push({
      text: `${payload.title ? `${payload.title} ` : ''}${payload.video}`
    })
  }
}
