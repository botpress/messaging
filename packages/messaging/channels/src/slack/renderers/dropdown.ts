import { ChannelRenderer } from '../../base/renderer'
import { SlackContext } from '../context'

export class SlackDropdownRenderer implements ChannelRenderer<SlackContext> {
  get priority(): number {
    return -1
  }

  handles(context: SlackContext): boolean {
    return !!context.payload.options?.length
  }

  render(context: SlackContext): void {
    const payload = context.payload // as DropdownContent

    context.message.blocks.push({
      type: 'actions',
      elements: [
        {
          type: 'static_select',
          action_id: 'option_selected',
          placeholder: {
            type: 'plain_text',
            text: payload.message
          },
          options: payload.options.map((q: any) => ({
            text: {
              type: 'plain_text',
              text: q.label
            },
            value: q.value
          }))
        }
      ]
    })
  }
}
