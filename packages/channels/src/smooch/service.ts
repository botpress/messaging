import { ChannelService, ChannelState } from '../base/service'
import { SmoochConfig } from './config'
const Smooch = require('smooch-core')

export interface SmoochState extends ChannelState<SmoochConfig> {
  smooch: any
  webhookSecret?: string
}

export class SmoochService extends ChannelService<SmoochConfig, SmoochState> {
  async create(scope: string, config: SmoochConfig) {
    return {
      config,
      smooch: new Smooch({
        keyId: config.keyId,
        secret: config.secret,
        scope: 'app'
      })
    }
  }
}
