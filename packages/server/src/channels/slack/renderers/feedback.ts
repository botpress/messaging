import { ChannelRenderer } from '../../base/renderer'
import { SlackContext } from '../context'

export class SlackFeedbackRenderer implements ChannelRenderer<SlackContext> {
  get priority(): number {
    return 1
  }

  handles(context: SlackContext): boolean {
    return !!context.payload.collectFeedback
  }

  render(context: SlackContext) {
    context?.message?.blocks?.push({
      type: 'section',
      // TODO: this can't work
      // block_id: `feedback-${context.event.incomingEventId}`,
      text: { type: 'mrkdwn', text: context.payload.text },
      accessory: {
        type: 'overflow',
        options: [
          {
            text: {
              type: 'plain_text',
              text: '👍'
            },
            value: '1'
          },
          {
            text: {
              type: 'plain_text',
              text: '👎'
            },
            value: '-1'
          }
        ],
        action_id: 'feedback-overflow'
      }
    })
  }
}
