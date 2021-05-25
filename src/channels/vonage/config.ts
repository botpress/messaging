import { ChannelConfig } from '../base/config'

export class VonageConfig extends ChannelConfig {
  useTestingApi?: boolean
  apiKey?: string
  apiSecret?: string
  signatureSecret?: string
  applicationId?: string
  privateKey?: string
}
