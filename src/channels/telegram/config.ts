import { ChannelConfig } from '../base/config'

export type TelegramConfig = ChannelConfig & {
  botToken: string
  webhookUrl?: string
}
