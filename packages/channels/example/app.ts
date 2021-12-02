import clc from 'cli-color'
import { Router } from 'express'
import { TelegramChannel } from '../src/telegram/channel'
import { TelegramConfig } from '../src/telegram/config'
import { TwilioChannel } from '../src/twilio/channel'
import { TwilioConfig } from '../src/twilio/config'

export class App {
  constructor(private router: Router, private config: any) {}

  async setup() {
    await this.setupTelegram()
    await this.setupTwilio()
  }

  private async setupTelegram() {
    const telegram = new TelegramChannel()
    await telegram.setup(this.router)

    telegram.on('message', async ({ scope, endpoint, content }) => {
      this.log('message', scope, { endpoint, content })
      await telegram.send(scope, endpoint, { text: 'yoyo' })
    })

    for (const [key, val] of Object.entries<TelegramConfig>(this.config.telegram)) {
      await telegram.start(key, val)
      this.log('conf', key, val)
    }
  }

  private async setupTwilio() {
    const twilio = new TwilioChannel()
    await twilio.setup(this.router)

    twilio.on('message', async ({ scope, endpoint, content }) => {
      this.log('message', scope, { endpoint, content })
      await twilio.send(scope, endpoint, { text: 'yoyo' })
    })

    for (const [key, val] of Object.entries<TwilioConfig>(this.config.twilio)) {
      await twilio.start(key, val)
      this.log('conf', key, val)
    }
  }

  private log(type: string, context: string, obj: any) {
    console.info(clc.blue(type), context, obj)
  }
}
