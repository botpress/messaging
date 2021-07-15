export interface TelegramConfig {
  enabled: boolean
  botToken: string

  // For request forwarding
  webhookUrl?: string
}
