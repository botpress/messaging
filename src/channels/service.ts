import { Router } from 'express'
import { ConfigService } from '../config/service'
import { Channel } from './base/channel'
import { ChannelConfig } from './base/config'
import { TwilioChannel } from './twilio/channel'

export class ChannelService {
  private channels: Channel[]

  constructor(private configService: ConfigService, private router: Router) {
    this.channels = [new TwilioChannel()]
  }

  setup() {
    for (const channel of this.channels) {
      const config = this.getConfig(channel.id)
      if (config.enabled) {
        channel.setup(config, this.router)
      }
    }
  }

  list() {
    return this.channels
  }

  get(channelId: string) {
    return this.channels.find((x) => x.id === channelId)
  }

  getConfig(channelId: string): ChannelConfig {
    return {
      ...(this.configService.current.channels?.[channelId] || {}),
      externalUrl: this.configService.current.externalUrl
    }
  }
}
