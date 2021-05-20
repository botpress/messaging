import { ChannelRenderer } from '../../base/renderer'
import { SlackContext } from '../context'

export class SlackChoicesRenderer implements ChannelRenderer<SlackContext> {
  get priority(): number {
    return 1
  }

  handles(context: SlackContext): boolean {
    return !!context.payload.choices?.length
  }

  render(context: SlackContext) {
    if (context.message.text) {
      context?.message?.blocks?.push({ type: 'section', text: { type: 'mrkdwn', text: context.message.text } })
    }

    context?.message?.blocks?.push({
      type: 'actions',
      elements: context.payload.choices.map((q: any, idx: any) => ({
        type: 'button',
        action_id: `replace_buttons${idx}`,
        text: {
          type: 'plain_text',
          text: q.title
        },
        value: q.value.toUpperCase()
      }))
    })
  }
}
