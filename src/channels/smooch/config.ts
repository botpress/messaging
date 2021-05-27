import { ChannelConfig } from '../base/config'

export type SmoochConfig = ChannelConfig & {
  keyId: string
  secret: string
  webhookSecret: string
}
