import { AudioRenderer } from '../../base/renderers/audio'
import { AudioContent } from '../../content/types'
import { WhatsappContext } from '../context'

export class WhatsappAudioRenderer extends AudioRenderer {
  renderAudio(context: WhatsappContext, payload: AudioContent) {
    context.messages.push({
      type: 'audio',
      audio: {
        link: payload.audio
      }
    })
  }
}
