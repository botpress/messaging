import { Markup } from 'telegraf'
import { ChoicesRenderer } from '../../base/renderers/choices'
import { ChoiceContent } from '../../content/types'
import { TelegramContext } from '../context'

export const QUICK_REPLY_PREFIX = 'quick_reply::'

export class TelegramChoicesRenderer extends ChoicesRenderer {
  renderChoice(context: TelegramContext, payload: ChoiceContent) {
    if (!context.messages.length) {
      context.messages.push({})
    }

    const buttons = payload.choices.map((x) => Markup.button.callback(x.title, `${QUICK_REPLY_PREFIX}${x.value}`))
    context.messages[0].extra = Markup.inlineKeyboard(buttons, { columns: 5 })
  }
}
