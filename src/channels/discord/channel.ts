import { Channel } from '../base/channel'
import { DiscordInstance } from './instance'

export class DiscordChannel extends Channel<DiscordInstance> {
  get name() {
    return 'discord'
  }

  get id() {
    return '51e500dc-2649-49cf-be31-5b63884fd9a6'
  }

  protected createInstance(providerName: string, clientId: string): DiscordInstance {
    return new DiscordInstance(
      this,
      providerName,
      clientId,
      this.kvs,
      this.conversations,
      this.messages,
      this.mapping,
      this.loggers
    )
  }

  async setupRoutes() {}
}
