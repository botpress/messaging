import clc from 'cli-color'
import { Router } from 'express'
import { Channel } from '../src/base/channel'
import { SlackChannel } from '../src/slack/channel'
import { SmoochChannel } from '../src/smooch/channel'
import { TeamsChannel } from '../src/teams/channel'
import { TelegramChannel } from '../src/telegram/channel'
import { TwilioChannel } from '../src/twilio/channel'

export class App {
  constructor(private router: Router, private config: any) {}

  async setup() {
    await this.setupChannel('telegram', new TelegramChannel())
    await this.setupChannel('twilio', new TwilioChannel())
    await this.setupChannel('smooch', new SmoochChannel())
    await this.setupChannel('teams', new TeamsChannel())
    await this.setupChannel('slack', new SlackChannel())
  }

  async setupChannel(name: string, channel: Channel<any, any, any, any>) {
    await channel.setup(this.router)

    channel.on('message', async ({ scope, endpoint, content }) => {
      this.log('message', name, scope, { endpoint, content })
      await channel.send(scope, endpoint, { text: 'yoyo' })
    })

    channel.api.makeUrl(async (scope: string) => {
      return `${this.config.externalUrl}/webhooks/${scope}/${channel.meta.name}`
    })

    for (const [key, val] of Object.entries<any>(this.config.scopes)) {
      if (val[name]) {
        await channel.start(key, val[name])
        this.log('conf', name, key, val[name])
      }
    }
  }

  private log(type: string, channel: string, context: string, obj: any) {
    console.info(clc.blue(type), clc.bold(channel), context, obj)
  }
}
