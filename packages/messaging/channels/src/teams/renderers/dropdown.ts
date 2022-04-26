import { CardFactory } from 'botbuilder'
import { ChannelRenderer } from '../../base/renderer'
import { TeamsContext } from '../context'
import { QUICK_REPLY_PREFIX } from './choices'

export class TeamsDropdownRenderer implements ChannelRenderer<TeamsContext> {
  get priority(): number {
    return 0
  }

  handles(context: TeamsContext): boolean {
    return context.payload.options?.length > 0
  }

  render(context: TeamsContext) {
    const payload = context.payload // TODO: as sdk.DropdownContent

    context.messages.push({
      attachments: [
        CardFactory.adaptiveCard({
          $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
          type: 'AdaptiveCard',
          version: '1.2',
          body: [
            {
              type: 'TextBlock',
              size: 'Medium',
              weight: 'Bolder',
              text: payload.message
            },
            {
              type: 'Input.ChoiceSet',
              choices: payload.options.map((opt: any, idx: any) => ({
                title: opt.label,
                id: `choice-${idx}`,
                value: `${QUICK_REPLY_PREFIX}${opt.value}::${opt.label}`
              })),
              id: 'text',
              placeholder: payload.placeholderText,
              wrap: true
            }
          ],
          actions: [
            {
              type: 'Action.Submit',
              title: payload.buttonText,
              id: 'btnSubmit'
            }
          ]
        })
      ]
    })
  }
}
