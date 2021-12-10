import { ActivityTypes, CardFactory } from 'botbuilder'
import { ChannelRenderer } from '../../base/renderer'
import { TeamsContext } from '../context'

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
      type: ActivityTypes.Message,
      attachments: [
        CardFactory.adaptiveCard({
          type: 'AdaptiveCard',
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
                value: opt.value
              })),
              id: 'text',
              placeholder: 'Select a choice',
              wrap: true
            }
          ],
          actions: [
            {
              type: 'Action.Submit',
              title: payload.buttonText,
              id: 'btnSubmit'
            }
          ],
          $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
          version: '1.2'
        })
      ]
    })
  }
}
