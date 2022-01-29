import { FileRenderer } from '../../base/renderers/file'
import { FileContent } from '../../content/types'
import { MessengerContext } from '../context'

export class MessengerFileRenderer extends FileRenderer {
  renderFile(context: MessengerContext, payload: FileContent) {
    context.messages.push({
      attachment: {
        type: 'file',
        payload: {
          is_reusable: true,
          url: payload.file
        }
      }
    })

    if (payload.title?.length) {
      context.messages.push({ text: payload.title })
    }
  }
}
