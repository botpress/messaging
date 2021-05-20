import { CardFactory } from 'botbuilder'
import { ChoiceContent } from '../../../content/types'
import { ChannelRenderer } from '../../base/renderer'
import { TeamsContext } from '../context'

export class TeamsChoicesRenderer implements ChannelRenderer<TeamsContext> {
  get priority(): number {
    return 1
  }

  handles(context: TeamsContext): boolean {
    return !!(context.payload.choices?.length && context.messages.length > 0)
  }

  render(context: TeamsContext) {
    const payload = context.payload as ChoiceContent
    const message = context.messages[0]

    message.attachments = [
      CardFactory.heroCard(
        '',
        CardFactory.images([]),
        CardFactory.actions(
          payload.choices.map((reply) => {
            return {
              title: reply.title as string,
              type: 'messageBack',
              value: reply.value,
              text: reply.value,
              displayText: reply.title as string
            }
          })
        )
      )
    ]
  }
}
