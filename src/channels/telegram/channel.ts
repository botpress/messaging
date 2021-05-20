import { Telegraf } from 'telegraf'
import { ConversationService } from '../../conversations/service'
import { KvsService } from '../../kvs/service'
import { MessageService } from '../../messages/service'
import { Channel } from '../base/channel'
import { Routers } from '../types'
import { TelegramConfig } from './config'

export class TelegramChannel extends Channel {
  get id() {
    return 'telegram'
  }

  async setup(
    config: TelegramConfig,
    kvsService: KvsService,
    conversationService: ConversationService,
    messagesService: MessageService,
    routers: Routers
  ) {
    const bot = new Telegraf(<string>config.botToken)
    const route = '/webhooks/telegram'

    await bot.telegram.setWebhook(`${config.externalUrl}${route}`)
    routers.raw.use(route, bot.webhookCallback('/'))

    const webhookUrl = config.externalUrl + route
    console.log(`Telegram webhook listening at ${webhookUrl}`)

    bot.on('message', async (x) => console.log('telegram', x))
  }

  async send(conversationId: string, payload: any) {}
}
