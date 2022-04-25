import path from 'path'
import { FileRenderer } from '../../base/renderers/file'
import { FileContent } from '../../content/types'
import { TelegramContext } from '../context'

export class TelegramFileRenderer extends FileRenderer {
  renderFile(context: TelegramContext, payload: FileContent) {
    context.messages.push({
      document: { url: payload.file, filename: path.basename(payload.file) },
      extra: { caption: payload.title }
    })
  }
}
