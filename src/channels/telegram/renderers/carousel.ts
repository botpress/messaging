import path from 'path'
import { Extra, Markup } from 'telegraf'
import { InlineKeyboardButton } from 'telegraf/typings/markup'
import { ActionOpenURL, ActionPostback, ActionSaySomething, CardContent } from '../../../content/types'
import { CarouselContext, CarouselRenderer } from '../../base/renderers/carousel'
import { formatUrl } from '../../url'
import { TelegramContext } from '../context'

type Context = CarouselContext<TelegramContext> & {
  buttons: InlineKeyboardButton[]
}

export class TelegramCarouselRenderer extends CarouselRenderer {
  startRenderCard(context: Context, card: CardContent) {
    if (card.image) {
      context.channel.messages.push({ action: 'upload_photo' })
      context.channel.messages.push({
        photo: { url: <string>formatUrl(context.channel.botUrl, card.image), filename: path.basename(card.image) }
      })
    }

    context.buttons = []
  }

  renderButtonUrl(context: Context, button: ActionOpenURL) {
    context.buttons.push(Markup.urlButton(button.title, button.url.replace('BOT_URL', context.channel.botUrl)))
  }

  renderButtonPostback(context: Context, button: ActionPostback) {
    context.buttons.push(Markup.callbackButton(button.title, button.payload))
  }

  renderButtonSay(context: Context, button: ActionSaySomething) {
    context.buttons.push(Markup.callbackButton(button.title, button.text))
  }

  endRenderCard(context: Context, card: CardContent) {
    context.channel.messages.push({
      text: `*${card.title}*\n${card.subtitle}`,
      extra: Extra.markdown(true).markup(Markup.inlineKeyboard(context.buttons))
    })
  }
}
