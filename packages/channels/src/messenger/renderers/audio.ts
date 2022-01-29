import { AudioRenderer } from '../../base/renderers/audio'
import { AudioContent } from '../../content/types'
import { MessengerContext } from '../context'

export class MessengerAudioRenderer extends AudioRenderer {
  renderAudio(context: MessengerContext, payload: AudioContent) {
    context.messages.push({
      attachment: {
        type: 'audio',
        payload: {
          is_reusable: true,
          url: payload.audio
        }
      }
    })

    if (payload.title?.length) {
      context.messages.push({ text: payload.title })
    }
  }
}
