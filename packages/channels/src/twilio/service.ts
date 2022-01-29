import { Twilio } from 'twilio'
import { ChannelService, ChannelState } from '../base/service'
import { TwilioConfig } from './config'

export interface TwilioState extends ChannelState<TwilioConfig> {
  twilio: Twilio
}

export class TwilioService extends ChannelService<TwilioConfig, TwilioState> {
  async create(scope: string, config: TwilioConfig) {
    return {
      config,
      twilio: new Twilio(config.accountSID, config.authToken)
    }
  }
}
