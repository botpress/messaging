import { ChannelConfig } from '../base/config'

export class MessengerConfig extends ChannelConfig {
  accessToken?: string
  appSecret?: string
  verifyToken?: string
}
