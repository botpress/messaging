import clc from 'cli-color'
import { Router } from 'express'
import { Channel } from '../src/base/channel'
import { SmoochChannel } from '../src/smooch/channel'
import { TelegramChannel } from '../src/telegram/channel'
import { TwilioChannel } from '../src/twilio/channel'

export class App {
  constructor(private router: Router, private config: any) {}

  async setup() {
    await this.setupChannel('telegram', new TelegramChannel())
    await this.setupChannel('twilio', new TwilioChannel())
    await this.setupChannel('smooch', new SmoochChannel())
  }

  async setupChannel(name: string, channel: Channel<any, any, any, any>) {
    await channel.setup(this.router)

    channel.on('message', async ({ scope, endpoint, content }) => {
      this.log('message', scope, { endpoint, content })
      await channel.send(scope, endpoint, { text: 'yoyo' })
    })

    for (const [key, val] of Object.entries<any>(this.config)) {
      if (val[name]) {
        await channel.start(key, val[name])
        this.log('conf', key, val[name])
      }
    }
  }

  private log(type: string, context: string, obj: any) {
    console.info(clc.blue(type), context, obj)
  }
}
