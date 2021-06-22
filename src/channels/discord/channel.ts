import { Channel } from '../base/channel'
import { DiscordConduit } from './conduit'

export class DiscordChannel extends Channel<DiscordConduit> {
  get name() {
    return 'discord'
  }

  get id() {
    return '51e500dc-2649-49cf-be31-5b63884fd9a6'
  }

  get lazy() {
    return false
  }

  createConduit() {
    return new DiscordConduit()
  }

  async setupRoutes() {}
}
