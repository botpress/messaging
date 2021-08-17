import clc from 'cli-color'
import disbut from 'discord-buttons'
import Discord from 'discord.js'
import LRU from 'lru-cache'
import { ConduitInstance, EndpointContent } from '../base/conduit'
import { ChannelContext } from '../base/context'
import { CardToCarouselRenderer } from '../base/renderers/card'
import { DropdownToChoicesRenderer } from '../base/renderers/dropdown'
import { DiscordConfig } from './config'
import { DiscordContext } from './context'
import { DiscordRenderers } from './renderers'
import { DiscordSenders } from './senders'

export class DiscordConduit extends ConduitInstance<DiscordConfig, DiscordContext> {
  private static patched = false

  private client!: Discord.Client
  private convoCache!: LRU<string, Discord.Channel>

  protected async setupConnection() {
    this.client = new Discord.Client()

    if (!DiscordConduit.patched) {
      disbut(this.client)
      DiscordConduit.patched = true
    }

    const conduit = (await this.app.conduits.get(this.conduitId))!
    const channel = this.app.channels.getById(conduit.channelId)

    this.convoCache = this.app.caching.newLRU()

    this.client.on('ready', () => {
      this.logger.info(
        `${clc.bold(channel.name.charAt(0).toUpperCase() + channel.name.slice(1))}` +
          ` logged in as ${clc.blackBright(this.client.user?.tag)}`
      )
    })

    this.client.on('message', async (msg) => {
      if (!msg.author.bot) {
        await this.receive(this.conduitId)
      }
    })

    this.client.on('clickButton', async (button) => {
      // TODO: do something with the button replies
      button.defer()
    })

    await this.client.login(this.config.token)
  }

  protected setupRenderers() {
    return [new CardToCarouselRenderer(), new DropdownToChoicesRenderer(), ...DiscordRenderers]
  }

  protected setupSenders() {
    return DiscordSenders
  }

  public async extractEndpoint(msg: Discord.Message): Promise<EndpointContent> {
    await this.setChannel(msg.channel.id, msg.channel)

    return {
      content: { type: 'text', text: msg.content },
      sender: msg.author.id,
      thread: msg.channel.id
    }
  }

  protected async getContext(base: ChannelContext<any>): Promise<DiscordContext> {
    return {
      ...base,
      client: this.client,
      channel: <any>await this.getChannel(base.thread!),
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

  async destroy() {
    this.client.destroy()
  }
}
