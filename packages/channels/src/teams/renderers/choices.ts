import { CardFactory } from 'botbuilder'
import { ChoicesRenderer } from '../../base/renderers/choices'
import { ChoiceContent } from '../../content/types'
import { TeamsContext } from '../context'

export const QUICK_REPLY_PREFIX = 'quick_reply::'

export class TeamsChoicesRenderer extends ChoicesRenderer {
  renderChoice(context: TeamsContext, payload: ChoiceContent) {
    if (!context.messages.length) {
      context.messages.push({})
    }

    if (!context.messages[0].attachments) {
      context.messages[0].attachments = []
    }

    context.messages[0].text = undefined
    context.messages[0].attachments.push(
      CardFactory.heroCard(
        payload.text,
        undefined,
        CardFactory.actions(
          payload.choices.map((x) => {
            return {
              type: 'messageBack',
              title: x.title,
              displayText: x.title,
              value: `${QUICK_REPLY_PREFIX}${x.value}::${x.title}`,
              text: `${QUICK_REPLY_PREFIX}${x.value}::${x.title}`
            }
          })
        )
      )
    )
  }
}
