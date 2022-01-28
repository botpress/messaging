import clc from 'cli-color'
import { Router } from 'express'
import { Channel } from '../src/base/channel'
import { MessengerChannel } from '../src/messenger/channel'
import payloads from './payloads.json'

export class App {
  constructor(private router: Router, private config: any) {}

  async setup() {
    await this.setupChannel('messenger', new MessengerChannel())
  }

  async setupChannel(name: string, channel: Channel) {
    await channel.setup(this.router)

    channel.on('message', async ({ scope, endpoint, content }) => {
      this.log('message', name, scope, { endpoint, content })

      const respond = async () => {
        try {
          if (content.type === 'say_something') {
            await channel.send(scope, endpoint, { type: 'text', text: `Say Something: ${content.text}` })
          } else if (content.type === 'postback') {
            await channel.send(scope, endpoint, { type: 'text', text: `Postback: ${content.payload}` })
          } else if (content.type === 'quick_reply') {
            await channel.send(scope, endpoint, { type: 'text', text: `Quick Reply: ${content.text}` })
          } else if (content.text?.startsWith('test')) {
            for (const payload of this.filterResponsePayloads(payloads, content.text)) {
              await channel.send(scope, endpoint, payload)
            }
          } else {
            await channel.send(scope, endpoint, { type: 'text', text: 'OK' })
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
        await channel.initialize(key)
        this.log('conf', name, key, val[name])
      }
    }
  }

  private log(type: string, channel: string, context: string, obj: any) {
    console.info(clc.blue(type), clc.bold(channel), context, obj)
  }

  private filterResponsePayloads(payloads: any[], filter: string) {
    const filtered = []
    for (const payload of payloads) {
      if (filter?.includes(payload.type)) {
        filtered.push(payload)
      }
    }

    return filtered.length ? filtered : payloads
  }
}
