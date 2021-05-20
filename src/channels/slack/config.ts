import { ChannelConfig } from '../base/config'

export class SlackConfig extends ChannelConfig {
  botToken?: string
  signingSecret?: string
  fetchUserInfo?: boolean
  useRTM?: boolean
}
