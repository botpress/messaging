import path from 'path'
import { Markup } from 'telegraf'
import { InlineKeyboardButton } from 'telegraf/typings/core/types/typegram'
import { ActionOpenURL, ActionPostback, ActionSaySomething, CardContent } from '../../../content/types'
import { CarouselContext, CarouselRenderer } from '../../base/renderers/carousel'
import { TelegramContext } from '../context'

type Hideable<B> = B & { hide: boolean }
type Context = CarouselContext<TelegramContext> & {
  buttons: Hideable<InlineKeyboardButton>[]
}

export class TelegramCarouselRenderer extends CarouselRenderer {
  startRenderCard(context: Context, _card: CardContent) {
    context.buttons = []
  }

  renderButtonUrl(context: Context, button: ActionOpenURL) {
    context.buttons.push(Markup.button.url(button.title, button.url))
  }

  renderButtonPostback(context: Context, button: ActionPostback) {
    context.buttons.push(Markup.button.callback(button.title, `postback::${button.payload}`))
  }

  renderButtonSay(context: Context, button: ActionSaySomething) {
    context.buttons.push(Markup.button.callback(button.title, `say::${button.text}`))
  }

  endRenderCard(context: Context, card: CardContent) {
    const text = `*${card.title}*${card.subtitle ? '\n' + card.subtitle : ''}`

    if (card.image) {
      context.channel.messages.push({ action: 'upload_photo' })
      context.channel.messages.push({
        photo: {
          url: card.image,
          filename: path.basename(card.image)
        },
        extra: {
          caption: text,
          ...Markup.inlineKeyboard(context.buttons)
        }
      })
    } else {
      context.channel.messages.push({
        text,
        extra: Markup.inlineKeyboard(context.buttons)
      })
    }
  }
}
