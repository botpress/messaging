import { FileContent } from '@botpress/messaging-content'
import { FileRenderer } from '../../base/renderers/file'
import { VonageContext } from '../context'

export class VonageFileRenderer extends FileRenderer {
  renderFile(context: VonageContext, payload: FileContent) {
    context.messages.push({ message_type: 'file', file: { url: payload.file, caption: payload.title } })
  }
}
