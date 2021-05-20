import path from 'path'
import { Extra, Markup } from 'telegraf'
import {
  ActionOpenURL,
  ActionPostback,
  ActionSaySomething,
  ButtonAction,
  CarouselContent
} from '../../../content/types'
import { ChannelRenderer } from '../../base/renderer'
import { formatUrl } from '../../url'
import { TelegramContext } from '../context'

export class TelegramCarouselRenderer implements ChannelRenderer<TelegramContext> {
  get priority(): number {
    return 0
  }

  handles(context: TelegramContext): boolean {
    return !!context.payload.items?.length
  }

  render(context: TelegramContext) {
    const { messages } = context
    const payload = context.payload as CarouselContent

    for (const card of payload.items) {
      if (card.image) {
        messages.push({ action: 'upload_photo' })
        messages.push({
          photo: { url: <string>formatUrl(context.botUrl, card.image), filename: path.basename(card.image) }
        })
      }

      const buttons = []
      for (const action of card.actions || []) {
        if (action.action === ButtonAction.OpenUrl) {
          buttons.push(Markup.urlButton(action.title, (action as ActionOpenURL).url.replace('BOT_URL', context.botUrl)))
        } else if (action.action === ButtonAction.Postback) {
          buttons.push(Markup.callbackButton(action.title, (action as ActionPostback).payload))
        } else if (action.action === ButtonAction.SaySomething) {
          buttons.push(Markup.callbackButton(action.title, (action as ActionSaySomething).text as string))
        }
      }

      messages.push({
        text: `*${card.title}*\n${card.subtitle}`,
        extra: Extra.markdown(true).markup(Markup.inlineKeyboard(buttons))
      })
    }
  }
}
