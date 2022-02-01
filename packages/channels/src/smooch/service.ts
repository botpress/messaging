import { ChannelService, ChannelState } from '../base/service'
import { SmoochConfig } from './config'
const SunshineConversationsClient = require('sunshine-conversations-client')

export interface SmoochState extends ChannelState<SmoochConfig> {
  smooch: any
}

export class SmoochService extends ChannelService<SmoochConfig, SmoochState> {
  async create(scope: string, config: SmoochConfig) {
    const SunshineConversationsClient = require('sunshine-conversations-client')
    const defaultClient = SunshineConversationsClient.ApiClient.instance

    const basicAuth = defaultClient.authentications['basicAuth']
    basicAuth.username = config.keyId
    basicAuth.password = config.keySecret

    const appInstance = new SunshineConversationsClient.MessagesApi()

    return {
      config,
      smooch: appInstance
    }
  }
}
