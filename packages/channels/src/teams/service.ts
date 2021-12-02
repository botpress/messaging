import { BotFrameworkAdapter, ConversationReference } from 'botbuilder'
import { ChannelService, ChannelState } from '../base/service'
import { TeamsConfig } from './config'

export interface TeamsState extends ChannelState<TeamsConfig> {
  adapter: BotFrameworkAdapter
}

export class TeamsService extends ChannelService<TeamsConfig, TeamsState> {
  protected refs: { [scope: string]: Partial<ConversationReference> } = {}

  async create(scope: string, config: TeamsConfig) {
    const adapter = new BotFrameworkAdapter({
      appId: config.appId,
      appPassword: config.appPassword,
      channelAuthTenant: config.tenantId
    })

    return {
      config,
      adapter
    }
  }

  async setRef(key: string, ref: Partial<ConversationReference>) {
    this.refs[key] = ref
  }

  async getRef(key: string): Promise<Partial<ConversationReference>> {
    return this.refs[key]
  }
}
