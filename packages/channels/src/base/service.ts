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
  start: ChannelStartEvent
  initialize: ChannelInitializeEvent
  send: ChannelSendEvent
  receive: ChannelReceiveEvent
  stop: ChannelStopEvent
}> {
  protected states: { [scope: string]: TState } = {}
  protected startCallback?: (scope: string) => Promise<TConfig>

  get scopes() {
    return Object.keys(this.states)
  }

  async setup() {}

  async start(scope: string, config: TConfig) {
    this.states[scope] = await this.create(scope, config)
    await this.emit('start', { scope })
  }

  async initialize(scope: string) {
    await this.emit('initialize', { scope })
  }

  async require(scope: string) {
    if (this.get(scope)) {
      return
    }

    await this.start(scope, await this.startCallback!(scope))
  }

  autoStart(callback: (scope: string) => Promise<TConfig>) {
    this.startCallback = callback
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
    await this.destroy(scope, this.get(scope))
    delete this.states[scope]
  }

  abstract destroy(scope: string, state: TState): Promise<void>

  public get(scope: string) {
    return this.states[scope]
  }
}

export interface ChannelStartEvent {
  scope: string
}

export interface ChannelInitializeEvent {
  scope: string
}

export interface ChannelStopEvent {
  scope: string
}

export interface ChannelSendEvent {
  scope: string
  endpoint: Endpoint
  content: any
}

export interface ChannelReceiveEvent {
  scope: string
  endpoint: Endpoint
  content: any
}
