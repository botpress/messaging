import { ChannelRenderer } from '../../base/renderer'
import { VonageContext } from '../context'

export class VonageDropdownRenderer implements ChannelRenderer<VonageContext> {
  get priority(): number {
    return -1
  }

  handles(context: VonageContext): boolean {
    return !!context.payload.options?.length
  }

  render(context: VonageContext): void {
    const payload = context.payload // as DropdownContent

    if (payload.options.length <= 10) {
      context.messages[0] = {
        message_type: 'custom',
        custom: {
          type: 'interactive',
          interactive: {
            type: 'list',
            body: {
              text: payload.message
            },
            action: {
              button: payload.buttonText,
              sections: [
                {
                  rows: payload.options.map((x: any, i: any) => ({ id: `slot-${i}::${x.value}`, title: x.label }))
                }
              ]
            }
          }
        }
      }
    } else {
      context.payload = {
        type: 'single-choice',
        text: payload.message,
        choices: payload.options.map((x: any) => ({ title: x.label, value: x.value }))
      }
    }
  }
}
