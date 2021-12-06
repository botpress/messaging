import Vonage from '@vonage/server-sdk'
import { ChannelService, ChannelState } from '../base/service'
import { VonageConfig } from './config'

export interface VonageState extends ChannelState<VonageConfig> {
  vonage: Vonage
}

export class VonageService extends ChannelService<VonageConfig, VonageState> {
  async create(scope: string, config: VonageConfig) {
    return {
      config,
      vonage: new Vonage(
        {
          apiKey: config.apiKey,
          apiSecret: config.apiSecret,
          applicationId: config.applicationId,
          privateKey: <any>Buffer.from(config.privateKey),
          signatureSecret: config.signatureSecret
        },
        {
          apiHost: config.useTestingApi ? 'https://messages-sandbox.nexmo.com' : 'https://api.nexmo.com'
        }
      )
    }
  }
}
