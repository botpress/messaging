import { ChannelRenderer } from '../../base/renderer'
import { ChoiceContent } from '../../content/types'
import { ChannelContext } from '../context'

export abstract class ChoicesRenderer implements ChannelRenderer<any> {
  get priority(): number {
    return 1
  }

  handles(context: ChannelContext<any>): boolean {
    const payload = context.payload as ChoiceContent
    return !!payload.choices?.length
  }

  render(context: ChannelContext<any>) {
    const payload = context.payload as ChoiceContent
    this.renderChoice(context, payload)
  }

  abstract renderChoice(context: ChannelContext<any>, payload: ChoiceContent): void
}
