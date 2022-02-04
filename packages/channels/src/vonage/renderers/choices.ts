import { IndexChoiceType } from '../../base/context'
import { ChoicesRenderer } from '../../base/renderers/choices'
import { ChoiceContent } from '../../content/types'
import { VonageContext } from '../context'

export class VonageChoicesRenderer extends ChoicesRenderer {
  renderChoice(context: VonageContext, payload: ChoiceContent) {
    if (payload.choices.length <= 3) {
      context.messages[0] = {
        message_type: 'custom',
        custom: {
          type: 'interactive',
          interactive: {
            type: 'button',
            body: {
              text: payload.text
            },
            action: {
              buttons: payload.choices.map((x, i) => ({
                type: 'reply',
                reply: { id: `slot-${i}::${x.value}`, title: x.title }
              }))
            }
          }
        }
      }
    } else if (payload.choices.length <= 10) {
      context.messages[0] = {
        message_type: 'custom',
        custom: {
          type: 'interactive',
          interactive: {
            type: 'list',
            body: {
              text: payload.text
            },
            action: {
              button: payload.text,
              sections: [
                {
                  rows: payload.choices.map((x, i) => ({ id: `slot-${i}::${x.value}`, title: x.title }))
                }
              ]
            }
          }
        }
      }
    } else {
      const message = context.messages[0]

      message.text = `${message.text}\n\n${payload.choices
        .map(({ title }, idx) => `*(${idx + 1})* ${title}`)
        .join('\n')}`

      context.prepareIndexResponse(
        context.scope,
        context.identity,
        context.sender,
        payload.choices.map((x) => ({ type: IndexChoiceType.QuickReply, ...x }))
      )
    }
  }
}
