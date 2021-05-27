import { ChannelConfig } from '../base/config'

export type VonageConfig = ChannelConfig & {
  useTestingApi: boolean
  apiKey: string
  apiSecret: string
  signatureSecret: string
  applicationId: string
  privateKey: string
}
