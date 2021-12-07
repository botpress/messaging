import { ChannelRenderer } from '../../base/renderer'
import { ChannelContext } from '../context'

export class DropdownToChoicesRenderer implements ChannelRenderer<ChannelContext<any>> {
  get priority(): number {
    return -1
  }

  handles(context: ChannelContext<any>): boolean {
    return !!context.payload.options?.length
  }

  render(context: ChannelContext<any>) {
    const payload = context.payload // as DropdownContent

    // we convert our dropdown to choices
    context.payload = {
      type: 'single-choice',
      text: payload.message,
      choices: payload.options.map((x: any) => ({ title: x.label, value: x.value }))
    }
  }
}
