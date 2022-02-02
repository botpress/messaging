import { ChannelService, ChannelState } from '../base/service'
import { SmoochConfig } from './config'
const SunshineConversationsClient = require('sunshine-conversations-client')

export interface SmoochState extends ChannelState<SmoochConfig> {
  smooch: {
    messages: any
    activity: any
  }
}

export class SmoochService extends ChannelService<SmoochConfig, SmoochState> {
  async create(scope: string, config: SmoochConfig) {
    const client = new SunshineConversationsClient.ApiClient()
    const auth = client.authentications['basicAuth']
    auth.username = config.keyId
    auth.password = config.keySecret

    return {
      config,
      smooch: {
        messages: new SunshineConversationsClient.MessagesApi(client),
        activity: new SunshineConversationsClient.ActivitiesApi(client)
      }
    }
  }
}
