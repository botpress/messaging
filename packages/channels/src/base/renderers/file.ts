import { ChannelRenderer } from '../../base/renderer'
import { FileContent } from '../../content/types'
import { ChannelContext } from '../context'

export abstract class FileRenderer implements ChannelRenderer<any> {
  get priority(): number {
    return 0
  }

  handles(context: ChannelContext<any>): boolean {
    const payload = context.payload as FileContent
    return !!payload.file
  }

  render(context: ChannelContext<any>) {
    const payload = context.payload as FileContent
    this.renderFile(context, payload)
  }

  abstract renderFile(context: ChannelContext<any>, payload: FileContent): void
}
