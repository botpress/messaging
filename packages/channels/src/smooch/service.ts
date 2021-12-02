// @ts-ignore
import Smooch from 'smooch-core'
import { Emitter } from '../base/emitter'
import { Endpoint } from '../base/endpoint'
import { SmoochConfig } from './config'

export class SmoochService extends Emitter<{
  start: { scope: string }
  send: { scope: string; endpoint: Endpoint; content: any }
  receive: { scope: string; endpoint: Endpoint; content: any }
  stop: { scope: string }
}> {
  private states: { [scope: string]: SmoochState } = {}

  async setup() {}

  async start(scope: string, config: SmoochConfig) {
    this.states[scope] = {
      config,
      smooch: new Smooch({
        keyId: config.keyId,
        secret: config.secret,
        scope: 'app'
      })
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

export interface SmoochState {
  config: SmoochConfig
  smooch: Smooch
}
