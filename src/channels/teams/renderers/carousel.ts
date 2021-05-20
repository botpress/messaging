import { AttachmentLayoutTypes, CardFactory } from 'botbuilder'
import {
  ActionOpenURL,
  ActionPostback,
  ActionSaySomething,
  ButtonAction,
  CarouselContent
} from '../../../content/types'
import { ChannelRenderer } from '../../base/renderer'
import { formatUrl } from '../../url'
import { TeamsContext } from '../context'

export class TeamsCarouselRenderer implements ChannelRenderer<TeamsContext> {
  get priority(): number {
    return 0
  }

  handles(context: TeamsContext): boolean {
    return !!context.payload.items?.length
  }

  render(context: TeamsContext) {
    const payload = context.payload as CarouselContent

    context.messages.push({
      type: 'message',
      attachments: payload.items.map((card: any) => {
        const contentUrl = formatUrl(context.botUrl, card.image)

        return CardFactory.heroCard(
          // TODO: what about the subtitle?
          card.title as string,
          CardFactory.images([contentUrl!]),
          CardFactory.actions(
            card.actions.map((button: any) => {
              if (button.action === ButtonAction.OpenUrl) {
                const url = (button as ActionOpenURL).url.replace('BOT_URL', context.botUrl)
                return {
                  type: 'openUrl',
                  value: url,
                  title: button.title
                }
              } else if (button.action === ButtonAction.SaySomething) {
                const say = (button as ActionSaySomething).text as string
                return {
                  type: 'messageBack',
                  title: button.title,
                  value: say,
                  text: say,
                  displayText: say
                }
              } else if (button.action === ButtonAction.Postback) {
                const payload = (button as ActionPostback).payload
                return {
                  type: 'messageBack',
                  title: button.title,
                  value: payload,
                  text: payload
                }
              }
            })
          )
        )
      }),
      attachmentLayout: AttachmentLayoutTypes.Carousel
    })
  }
}
