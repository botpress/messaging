import { Extra, Markup } from 'telegraf'
import { ChoiceContent } from '../../../content/types'
import { ChannelRenderer } from '../../base/renderer'
import { TelegramContext } from '../context'

export class TelegramChoicesRenderer implements ChannelRenderer<TelegramContext> {
  get priority(): number {
    return 1
  }

  handles(context: TelegramContext): boolean {
    return !!(context.payload.choices && context.messages.length > 0)
  }

  render(context: TelegramContext) {
    const message = context.messages[0]
    const payload = context.payload as ChoiceContent

    const buttons = payload.choices.map((x) => Markup.callbackButton(x.title as string, x.value))
    const keyboard = Markup.keyboard(buttons)

    message.extra = Extra.markdown(false).markup({ ...keyboard, one_time_keyboard: true })
  }
}
