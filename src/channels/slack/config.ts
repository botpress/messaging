import { ChannelConfig } from '../base/config'

export type SlackConfig = ChannelConfig & {
  botToken: string
  signingSecret: string
  fetchUserInfo: boolean
  useRTM: boolean
}
