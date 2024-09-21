import { IndexChoiceType } from '../../base/context'
import { ChoicesRenderer } from '../../base/renderers/choices'
import { ChoiceContent, ChoiceOption } from '../../content/types'
import { WhatsappContext } from '../context'

export class WhatsappChoicesRenderer extends ChoicesRenderer {
  renderChoice(context: WhatsappContext, payload: ChoiceContent): void {
    if (payload.choices.length && context.messages.length) {
      if (payload.choices.length <= 3) {
        context.messages[0] = {
          type: 'interactive',
          interactive: {
            type: 'button',
            body: {
              text: payload.text.substring(0, 1024)
            },
            action: {
              buttons: payload.choices.map((choice) => ({
                type: 'reply',
                reply: {
                  id: `${IndexChoiceType.QuickReply}::${choice.value}`,
                  title: choice.title.substring(0, 20)
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
              text: payload.text.substring(0, 4096)
            },
            action: {
              button: 'Select...',
              sections: [
                {
                  rows: payload.choices.map((choice) => ({
                    id: `${IndexChoiceType.QuickReply}::${choice.value}`,
                    title: choice.title.substring(0, 24)
                  }))
                }
              ]
            }
          }
        }
      } else {
        const text = `${payload.text}\n\n${payload.choices
          .map(({ title }, index) => `${index + 1}. ${title}`)
          .join('\n')}`

        context.messages[0] =  {
          type: 'text',
          text: {
            preview_url: false,
            body: text.substring(0, 4096)
          }
        }
        context.prepareIndexResponse(
          context.scope,
          context.identity,
          context.sender,
          payload.choices.map((choice: ChoiceOption) => ({...choice, type: IndexChoiceType.QuickReply }))
        )
      }
    }
  }
}
