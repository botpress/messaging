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

    context.message.blocks?.push({
      type: 'input',
      element: {
        type: 'static_select',
        placeholder: payload.placeholderText
          ? {
              type: 'plain_text',
              text: payload.placeholderText
            }
          : undefined,
        options: payload.options.map((q: any) => ({
          text: {
            type: 'plain_text',
            text: q.label
          },
          value: q.value
        }))
      },
      label: {
        type: 'plain_text',
        text: payload.message
      }
    })
  }
}
