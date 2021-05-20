import { ActionOpenURL, ActionPostback, ActionSaySomething, CardContent, ChoiceOption } from '../../../content/types'
import { CarouselRenderer, CarouselContext } from '../../base/renderers/carousel'
import { formatUrl } from '../../url'
import { TwilioContext } from '../context'

type Context = CarouselContext<TwilioContext> & {
  options: ChoiceOption[]
}

export class TwilioCarouselRenderer extends CarouselRenderer {
  startRenderCard(context: Context, card: CardContent) {
    context.options = []
  }

  renderButtonUrl(context: Context, button: ActionOpenURL) {
    context.options.push({
      title: `${button.title} : ${button.url.replace('BOT_URL', context.channel.botUrl)}`,
      value: ''
    })
  }

  renderButtonPostback(context: Context, button: ActionPostback) {
    context.options.push({ title: button.title, value: button.payload })
  }

  renderButtonSay(context: Context, button: ActionSaySomething) {
    context.options.push({
      title: button.title,
      value: button.text
    })
  }

  endRenderCard(context: Context, card: CardContent) {
    const body = `${card.title}\n\n${card.subtitle || ''}`

    context.channel.messages.push(<any>{ body, mediaUrl: formatUrl(context.channel.botUrl, card.image) })
    context.channel.payload.choices = context.options
  }
}
