import { CardFactory } from 'botbuilder'
import { ChoicesRenderer } from '../../base/renderers/choices'
import { ChoiceContent } from '../../content/types'
import { TeamsContext } from '../context'

export class TeamsChoicesRenderer extends ChoicesRenderer {
  renderChoice(context: TeamsContext, payload: ChoiceContent) {
    if (!context.messages.length) {
      context.messages.push({})
    }

    if (!context.messages[0].attachments) {
      context.messages[0].attachments = []
    }

    context.messages[0].attachments?.push(
      CardFactory.heroCard(
        '',
        CardFactory.images([]),
        CardFactory.actions(
          payload.choices.map((x) => {
            return {
              title: x.title,
              type: 'messageBack',
              value: x.value,
              text: x.value,
              displayText: x.title
            }
          })
        )
      )
    )
  }
}
