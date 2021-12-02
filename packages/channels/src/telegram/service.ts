import { Telegraf } from 'telegraf'
import { TelegrafContext } from 'telegraf/typings/context'
import { Emitter } from '../base/emitter'
import { Endpoint } from '../base/endpoint'
import { TelegramConfig } from './config'

export class TelegramService extends Emitter<{
  start: { scope: string }
  send: { scope: string; endpoint: Endpoint; content: any }
  receive: { scope: string; endpoint: Endpoint; content: any }
  stop: { scope: string }
}> {
  private states: { [scope: string]: TelegramState } = {}

  async setup() {}

  async start(scope: string, config: TelegramConfig) {
    const telegraf = new Telegraf(config.botToken)
    const callback = telegraf.webhookCallback(`/${config.botToken}`)

    this.states[scope] = {
      config,
      telegraf,
      callback
    }

    await this.emit('start', { scope })
  }

  async send(scope: string, endpoint: Endpoint, content: any) {
    await this.emit('send', { scope, endpoint, content })
  }

  async receive(scope: string, endpoint: Endpoint, content: any) {
    await this.emit('receive', { scope, endpoint, content })
  }

  async stop(scope: string) {
    await this.emit('stop', { scope })
  }

  public get(scope: string) {
    return this.states[scope]
  }
}

export interface TelegramState {
  config: TelegramConfig
  telegraf: Telegraf<TelegrafContext>
  callback: (req: any, res: any) => void
}
