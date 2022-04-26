import { FileRenderer } from '../../base/renderers/file'
import { FileContent } from '../../content/types'
import { SmoochContext } from '../context'

export class SmoochFileRenderer extends FileRenderer {
  renderFile(context: SmoochContext, payload: FileContent) {
    context.messages.push({ type: 'file', text: payload.title, mediaUrl: payload.file })
  }
}
