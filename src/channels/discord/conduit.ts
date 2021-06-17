import clc from 'cli-color'
import disbut from 'discord-buttons'
import Discord from 'discord.js'
import LRU from 'lru-cache'
import { ConduitInstance, EndpointContent } from '../base/conduit'
import { ChannelContext } from '../base/context'
import { CardToCarouselRenderer } from '../base/renderers/card'
import { DiscordConfig } from './config'
import { DiscordContext } from './context'
import { DiscordRenderers } from './renderers'
import { DiscordSenders } from './senders'

export class DiscordConduit extends ConduitInstance<DiscordConfig, DiscordContext> {
  private client!: Discord.Client
  private convoCache!: LRU<string, Discord.Channel>

  protected async setupConnection() {
    this.client = new Discord.Client()
    disbut(this.client)

    this.convoCache = this.app.caching.newLRU()

    this.client.on('ready', () => {
      this.logger.info(
        `${clc.bold(this.channel.name.charAt(0).toUpperCase() + this.channel.name.slice(1))}` +
          ` logged in as ${clc.blackBright(this.client.user?.tag)}`
      )
    })

    this.client.on('message', async (msg) => {
      if (!msg.author.bot) {
        await this.receive(msg)
      }
    })

    this.client.on('clickButton', async (button) => {
      // TODO: do something with the button replies
      button.defer()
    })

    await this.client.login(this.config.token)
  }

  protected setupRenderers() {
    return [new CardToCarouselRenderer(), ...DiscordRenderers]
  }

  protected setupSenders() {
    return DiscordSenders
  }

  protected async map(msg: Discord.Message): Promise<EndpointContent> {
    await this.setChannel(msg.channel.id, msg.channel)

    return {
      content: { type: 'text', text: msg.content },
      foreignUserId: msg.author.id,
      foreignConversationId: msg.channel.id
    }
  }

  protected async context(base: ChannelContext<any>): Promise<DiscordContext> {
    return {
      ...base,
      client: this.client,
      channel: <any>await this.getChannel(base.foreignConversationId!),
      messages: []
    }
  }

  private async getChannel(channelId: string): Promise<Discord.Channel> {
    const cached = this.convoCache.get(channelId)
    if (cached) {
      return cached
    }

    const channel = await this.client.channels.fetch(channelId, true)
    this.convoCache.set(channelId, channel!)
    return channel!
  }

  private async setChannel(channelId: string, channel: Discord.Channel): Promise<void> {
    if (this.convoCache.get(channelId)) {
      return
    }

    this.convoCache.set(channelId, channel)
  }
}
