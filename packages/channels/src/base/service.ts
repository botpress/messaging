import { Emitter } from '../base/emitter'
import { Endpoint } from '../base/endpoint'
import { ChannelConfig } from './config'

export interface ChannelState<T> {
  config: T
}

export abstract class ChannelService<
  TConfig extends ChannelConfig,
  TState extends ChannelState<TConfig>
> extends Emitter<{
  start: { scope: string }
  send: { scope: string; endpoint: Endpoint; content: any }
  receive: { scope: string; endpoint: Endpoint; content: any }
  stop: { scope: string }
}> {
  protected states: { [scope: string]: TState } = {}

  async setup() {}

  async start(scope: string, config: TConfig) {
    this.states[scope] = await this.create(scope, config)
    await this.emit('start', { scope })
  }

  abstract create(scope: string, config: TConfig): Promise<TState>

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
