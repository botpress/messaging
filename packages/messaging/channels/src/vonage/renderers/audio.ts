import { AudioContent } from '@botpress/messaging-content'
import { AudioRenderer } from '../../base/renderers/audio'
import { VonageContext } from '../context'

export class VonageAudioRenderer extends AudioRenderer {
  renderAudio(context: VonageContext, payload: AudioContent) {
    context.messages.push({ message_type: 'audio', audio: { url: payload.audio } })
  }
}
