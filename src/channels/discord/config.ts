import { ChannelConfig } from '../base/config'

export type DiscordConfig = ChannelConfig & {
  token: string
}
