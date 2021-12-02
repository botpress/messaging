import { Twilio } from 'twilio'
import { Emitter } from '../base/emitter'
import { Endpoint } from '../base/endpoint'
import { TwilioConfig } from './config'

export class TwilioService extends Emitter<{
  start: { scope: string }
  send: { scope: string; endpoint: Endpoint; content: any }
  receive: { scope: string; endpoint: Endpoint; content: any }
  stop: { scope: string }
}> {
  private states: { [scope: string]: TwilioState } = {}

  async setup() {}

  async start(scope: string, config: TwilioConfig) {
    this.states[scope] = {
      config,
      twilio: new Twilio(config.accountSID, config.authToken)
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

export interface TwilioState {
  config: TwilioConfig
  twilio: Twilio
}
