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
import { VonageContext } from '../context'

export class VonageCarouselRenderer implements ChannelRenderer<VonageContext> {
  get priority(): number {
    return 0
  }

  handles(context: VonageContext): boolean {
    return !!context.payload.items?.length
  }

  render(context: VonageContext) {
    const payload = context.payload as CarouselContent
    let lastOptions: ChoiceOption[]

    // We down render carousel to text so it works with whatsapp
    for (const { subtitle, title, image, actions } of payload.items) {
      let body = `${title}\n\n${subtitle || ''}`
      const options: ChoiceOption[] = []

      for (const button of actions || []) {
        const title = button.title as string

        if (button.action === ButtonAction.OpenUrl) {
          options.push({
            title: `${title} : ${(button as ActionOpenURL).url.replace('BOT_URL', context.botUrl)}`,
            value: undefined!
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

      body = `${body}\n\n${options.map(({ title }, idx) => `*(${idx + 1})* ${title}`).join('\n')}`

      if (image) {
        context.messages.push({
          content: {
            type: 'image',
            text: undefined!,
            image: {
              url: formatUrl(context.botUrl, image)!,
              caption: body
            }
          }
        })
      } else {
        context.messages.push({
          content: {
            type: 'text',
            text: body
          }
        })
      }

      lastOptions = options
    }

    // TODO: reimpl
    /*
    if (lastOptions) {
      context.prepareIndexResponse(context.event, lastOptions)
    }
    */
  }
}
