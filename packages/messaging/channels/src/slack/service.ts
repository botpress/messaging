import { App } from '@slack/bolt'
import { ChannelService, ChannelState } from '../base/service'
import { SlackConfig } from './config'

export interface SlackState extends ChannelState<SlackConfig> {
  app: App
}

export class SlackService extends ChannelService<SlackConfig, SlackState> {
  async create(scope: string, config: SlackConfig) {
    return {
      config,
      app: new App({
        signingSecret: config.signingSecret,
        token: config.botToken,
        tokenVerificationEnabled: false,
        // We send a fake receiver here because we implement a receiver
        // that works completely different than what bolt expects
        receiver: { init: () => {} } as any
      })
    }
  }
}
