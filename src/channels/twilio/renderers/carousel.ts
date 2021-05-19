import {
  ActionOpenURL,
  ActionPostback,
  ActionSaySomething,
  ButtonAction,
  CarouselContent,
  ChoiceOption
} from '../../../content/types'
import { ChannelRenderer } from '../../base/renderer'
import { formatUrl } from '../../url'
import { TwilioContext } from '../context'

export class TwilioCarouselRenderer implements ChannelRenderer<TwilioContext> {
  get priority(): number {
    return 0
  }

  handles(context: TwilioContext): boolean {
    return !!context.payload.items?.length
  }

  render(context: TwilioContext) {
    const payload = context.payload as CarouselContent

    // We down render carousel to text so it works with sms
    for (const { subtitle, title, image, actions } of payload.items) {
      const body = `${title}\n\n${subtitle || ''}`
      const options: ChoiceOption[] = []

      for (const button of actions || []) {
        const title = button.title as string

        if (button.action === ButtonAction.OpenUrl) {
          options.push({
            title: `${title} : ${(button as ActionOpenURL).url.replace('BOT_URL', context.botUrl)}`,
            value: ''
          })
        } else if (button.action === ButtonAction.Postback) {
          options.push({ title, value: (button as ActionPostback).payload })
        } else if (button.action === ButtonAction.SaySomething) {
          options.push({
            title,
            value: (button as ActionSaySomething).text as string
          })
        }
      }

      // TODO fix any not working with medial url
      context.messages.push(<any>{ body, mediaUrl: formatUrl(context.botUrl, image) })
      context.payload.choices = options
    }
  }
}
