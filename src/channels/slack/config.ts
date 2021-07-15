export interface SlackConfig {
  enabled: boolean
  botToken: string
  signingSecret: string
  fetchUserInfo: boolean
  useRTM: boolean
}
