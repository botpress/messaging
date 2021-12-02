// @ts-ignore
import Smooch from 'smooch-core'
import { ChannelService, ChannelState } from '../base/service'
import { SmoochConfig } from './config'

export interface SmoochState extends ChannelState<SmoochConfig> {
  smooch: Smooch
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
