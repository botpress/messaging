import { FileContent } from '@botpress/messaging-content'
import { FileRenderer } from '../../base/renderers/file'
import { MessengerContext } from '../context'

export class MessengerFileRenderer extends FileRenderer {
  renderFile(context: MessengerContext, payload: FileContent) {
    context.messages.push({ text: `${payload.title ? `${payload.title}\n` : payload.title}${payload.file}` })
  }
}
