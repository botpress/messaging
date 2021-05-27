import { ChannelConfig } from '../base/config'

export type TwilioConfig = ChannelConfig & {
  accountSID: string
  authToken: string
}
