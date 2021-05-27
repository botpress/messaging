import disbut from 'discord-buttons'
import { ActionOpenURL, ActionPostback, ActionSaySomething, CardContent, CarouselContent } from '../../../content/types'
import { CarouselContext, CarouselRenderer } from '../../base/renderers/carousel'
import { DiscordContext } from '../context'

type Context = CarouselContext<DiscordContext> & {
  buttons: disbut.MessageButton[]
}

export class DiscordCarouselRenderer extends CarouselRenderer {
  startRenderCard(context: Context, card: CardContent) {
    context.buttons = []
  }

  renderButtonUrl(context: Context, button: ActionOpenURL) {
    context.buttons.push(
      new disbut.MessageButton().setStyle('blurple').setLabel(button.title).setID('url').setURL(button.url)
    )
  }

  renderButtonPostback(context: Context, button: ActionPostback) {
    context.buttons.push(new disbut.MessageButton().setStyle('blurple').setLabel(button.title).setID(button.payload))
  }

  renderButtonSay(context: Context, button: ActionSaySomething) {
    context.buttons.push(new disbut.MessageButton().setStyle('blurple').setLabel(button.title).setID(button.text))
  }

  endRenderCard(context: Context, card: CardContent) {
    context.channel.messages.push({
      content: card.title,
      options: <any>{ files: card.image ? [card.image] : undefined, buttons: context.buttons }
    })
  }
}
