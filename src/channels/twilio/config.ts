export interface TwilioConfig {
  enabled: boolean
  accountSID: string
  authToken: string

  // For request forwarding
  webhookUrl?: string
}
