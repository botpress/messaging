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
      appPassword: config.appPassword
    })

    return {
      config,
      adapter
    }
  }

  async setRef(scope: string, key: string, ref: Partial<ConversationReference>) {
    if (this.kvs) {
      await this.kvs.set(`${scope}_${key}`, ref)
    } else {
      this.refs[key] = ref
    }
  }

  async getRef(scope: string, key: string): Promise<Partial<ConversationReference>> {
    if (this.kvs) {
      return this.kvs.get(`${scope}_${key}`)
    } else {
      return this.refs[key]
    }
  }
}
