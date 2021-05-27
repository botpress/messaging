import { ChannelConfig } from '../base/config'

export type MessengerConfig = ChannelConfig & {
  accessToken: string
  appSecret: string
  verifyToken: string
}
