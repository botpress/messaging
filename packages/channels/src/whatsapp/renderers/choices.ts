import { ChoicesRenderer } from '../../base/renderers/choices'
import { ChoiceContent } from '../../content/types'
import { WhatsappContext } from '../context'

export class WhatsappChoicesRenderer extends ChoicesRenderer {
  renderChoice(context: WhatsappContext, payload: ChoiceContent): void {
    if (payload.choices.length <= 3) {
      context.messages[0] = {
        type: 'interactive',
        interactive: {
          type: 'button',
          body: {
            text: payload.text
          },
          action: {
            buttons: payload.choices.map((choice) => ({
              type: 'reply',
              reply: {
                id: `reply::${choice.value}`,
                title: choice.title
              }
            }))
          }
        }
      }
    } else if (payload.choices.length <= 10) {
      context.messages[0] = {
        type: 'interactive',
        interactive: {
          type: 'list',
          body: {
            text: payload.text
          },
          action: {
            button: 'Browse',
            sections: [
              {
                rows: payload.choices.map((choice) => ({
                  id: `reply::${choice.value}`,
                  title: choice.title
                }))
              }
            ]
          }
        }
      }
    }
  }
}
