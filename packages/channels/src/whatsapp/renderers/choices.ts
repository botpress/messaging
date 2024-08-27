import { ChoicesRenderer } from '../../base/renderers/choices'
import { ChoiceContent } from '../../content/types'
import { WhatsappContext } from '../context'
import { WhatsappOutgoingMessage } from '../whatsapp'

export class WhatsappChoicesRenderer extends ChoicesRenderer {
  renderChoice(context: WhatsappContext, payload: ChoiceContent): void {
    if (payload.choices.length) {
      let message: WhatsappOutgoingMessage
      if (payload.choices.length <= 10) {
        if (payload.choices.length <= 3) {
          message = {
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
                    id: `quick_reply::${choice.value}`,
                    title: choice.title.substring(0, 20)
                  }
                }))
              }
            }
          }
        } else {
          message = {
            type: 'interactive',
            interactive: {
              type: 'list',
              body: {
                text: payload.text.substring(0, 1024)
              },
              action: {
                button: 'Select...',
                sections: [
                  {
                    rows: payload.choices.map((choice) => ({
                      id: `quick_reply::${choice.value}`,
                      title: choice.title.substring(0, 20)
                    }))
                  }
                ]
              }
            }
          }
        }
      } else {
        message = {
          type: 'text',
          text: {
            preview_url: false,
            body: `${payload.text}\n\n${payload.choices
              .map(({ title }, index) => `*${index + 1}.)* ${title}`)
              .join('\n')}`
          }
        }
      }
      context.messages[0] = message
    }
  }
}
