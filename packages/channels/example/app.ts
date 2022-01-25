import clc from 'cli-color'
import { Router } from 'express'
import { Channel } from '../src/base/channel'
import { TelegramChannel } from '../src/telegram/channel'
import payloads from './payloads.json'

export class App {
  constructor(private router: Router, private config: any) {}

  async setup() {
    await this.setupChannel('telegram', new TelegramChannel())
  }

  async setupChannel(name: string, channel: Channel) {
    await channel.setup(this.router)

    channel.on('message', async ({ scope, endpoint, content }) => {
      this.log('message', name, scope, { endpoint, content })

      const respond = async () => {
        try {
          for (const payload of payloads) {
            await channel.send(scope, endpoint, payload)
          }
        } catch (e) {
          console.error('Error occurred sending message', e)
        }
      }

      void respond()
    })

    channel.makeUrl(async (scope: string) => {
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
