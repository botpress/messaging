import { AudioRenderer } from '../../base/renderers/audio'
import { AudioContent } from '../../content/types'
import { VonageContext } from '../context'

export class VonageAudioRenderer extends AudioRenderer {
  renderAudio(context: VonageContext, payload: AudioContent) {
    context.messages.push({ message_type: 'audio', audio: { url: payload.audio } })
  }
}
