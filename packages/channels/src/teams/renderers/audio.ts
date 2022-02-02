import { ActivityTypes } from 'botbuilder'
import { AudioRenderer } from '../../base/renderers/audio'
import { AudioContent } from '../../content/types'
import { TeamsContext } from '../context'

export class TeamsAudioRenderer extends AudioRenderer {
  renderAudio(context: TeamsContext, payload: AudioContent) {
    context.messages.push({
      type: ActivityTypes.Message,
      text: `${payload.title ? `${payload.title} ` : ''}${payload.audio}`
    })
  }
}
