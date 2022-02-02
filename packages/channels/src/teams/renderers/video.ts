import { ActivityTypes } from 'botbuilder'
import { VideoRenderer } from '../../base/renderers/video'
import { VideoContent } from '../../content/types'
import { TeamsContext } from '../context'

export class TeamsVideoRenderer extends VideoRenderer {
  renderVideo(context: TeamsContext, payload: VideoContent) {
    context.messages.push({
      type: ActivityTypes.Message,
      text: `${payload.title ? `${payload.title} ` : ''}${payload.video}`
    })
  }
}
