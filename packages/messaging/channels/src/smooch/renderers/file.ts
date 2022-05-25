import { FileContent } from '@botpress/messaging-content'
import { FileRenderer } from '../../base/renderers/file'
import { SmoochContext } from '../context'

export class SmoochFileRenderer extends FileRenderer {
  renderFile(context: SmoochContext, payload: FileContent) {
    context.messages.push({ type: 'file', text: payload.title, mediaUrl: payload.file })
  }
}
