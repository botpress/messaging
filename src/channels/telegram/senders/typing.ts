import { ChannelSender } from '../../base/sender'
import { TelegramContext } from '../context'

export class TelegramTypingSender implements ChannelSender<TelegramContext> {
  get priority(): number {
    return -1
  }

  get id(): string {
    return TelegramTypingSender.name
  }

  handles(context: TelegramContext): boolean {
    const typing = context.payload.typing
    return context.handlers.length > 0 && (typing === undefined || typing === true)
  }

  async send(context: TelegramContext) {
    const delay = context.payload.delay ?? 1000
    await context.client.telegram.sendChatAction(context.foreignConversationId!, 'typing')

    // TODO: doesn't work??
    // await Promise.delay(delay)
  }
}
