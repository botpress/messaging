import clc from 'cli-color'
import { Router } from 'express'
import Joi from 'joi'
import { Channel } from '../src/base/channel'
import { MessengerChannel } from '../src/messenger/channel'
import { SlackChannel } from '../src/slack/channel'
import { SmoochChannel } from '../src/smooch/channel'
import { TeamsChannel } from '../src/teams/channel'
import { TelegramChannel } from '../src/telegram/channel'
import { TwilioChannel } from '../src/twilio/channel'
import { VonageChannel } from '../src/vonage/channel'
import payloads from './payloads.json'

export class App {
  constructor(private router: Router, private config: any) {}

  async setup() {
    await this.setupChannel('messenger', new MessengerChannel())
    await this.setupChannel('slack', new SlackChannel())
    await this.setupChannel('smooch', new SmoochChannel())
    await this.setupChannel('teams', new TeamsChannel())
    await this.setupChannel('telegram', new TelegramChannel())
    await this.setupChannel('twilio', new TwilioChannel())
    await this.setupChannel('vonage', new VonageChannel())
  }

  async setupChannel(name: string, channel: Channel) {
    await channel.setup(this.router, {
      info: (message: string, data?: any) => {
        // eslint-disable-next-line no-console
        console.log(message, data)
      },
      debug: (message: string, data?: any) => {
        console.debug(message, data)
      },
      warn: (message: string, data?: any) => {
        console.warn(message, data)
      },
      error: (error: Error, message?: string, data?: any) => {
        console.error(message, error?.message, (<any>error).response?.data, data)
      }
    })

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
            await channel.send(scope, endpoint, { type: 'text', text: 'OK', typing: true })
          }
        } catch (e) {
          console.error('Error occurred sending message', e)
        }
      }

      void respond()
    })

    channel.makeUrl(async (scope: string) => {
      return `${this.config.externalUrl}/webhooks/v1/${scope}/${channel.meta.name}`
    })

    for (const [key, val] of Object.entries<any>(this.config.scopes)) {
      if (val[name]) {
        const { error } = Joi.object(channel.meta.schema).validate(val[name])
        if (error) {
          this.log('conf-err', name, key, error.message)
        } else {
          await channel.start(key, val[name])
          await channel.initialize(key)
          this.log('conf', name, key, val[name])
        }
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
