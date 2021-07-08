import { ChannelConfig } from '../base/config'

export type TeamsConfig = ChannelConfig & {
  appId: string
  appPassword: string
  tenantId: string
  proactiveMessages: {
    [Key: string]: string
  }
}
