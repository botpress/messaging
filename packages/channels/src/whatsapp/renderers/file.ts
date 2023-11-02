import { FileRenderer } from '../../base/renderers/file'
import { FileContent } from '../../content/types'
import { WhatsappContext } from '../context'

export class WhatsappFileRenderer extends FileRenderer {
  renderFile(context: WhatsappContext, payload: FileContent) {
    context.messages.push({
      type: 'document',
      document: {
        link: payload.file,
        caption: payload.title
      }
    })
  }
}
