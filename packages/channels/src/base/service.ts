import LRU from 'lru-cache'
import ms from 'ms'
import { ChannelStateManager } from '..'
import { Emitter } from '../base/emitter'
import { Endpoint } from '../base/endpoint'
import { ChannelConfig } from './config'
import { IndexChoiceOption, IndexChoiceType } from './context'
import { Kvs } from './kvs'
import { Logger } from './logger'

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
  proactive: ChannelProactiveEvent
  receive: ChannelReceiveEvent
  stop: ChannelStopEvent
}> {
  public logger?: Logger
  public kvs?: Kvs

  protected cacheIndexResponses: LRU<string, IndexChoiceOption[]> = new LRU({ max: 50000, maxAge: ms('5min') })
  protected states: { [scope: string]: TState } = {}
  protected startCallback?: (scope: string) => Promise<void>
  protected manager?: ChannelStateManager

  get scopes() {
    return Object.keys(this.states)
  }

  async setup() {}

  async start(scope: string, config: TConfig) {
    const state = await this.create(scope, config)

    if (this.manager) {
      this.manager.set(scope, state)
    } else {
      this.states[scope] = state
    }

    await this.emit('start', { scope })
  }

  async initialize(scope: string) {
    await this.emit('initialize', { scope })
  }

  async require(scope: string) {
    if (this.get(scope)) {
      return
    }

    await this.startCallback!(scope)
  }

  autoStart(callback: (scope: string) => Promise<void>) {
    this.startCallback = callback
  }

  stateManager(manager: ChannelStateManager) {
    this.manager = manager
  }

  abstract create(scope: string, config: TConfig): Promise<TState>

  async send(scope: string, endpoint: Endpoint, content: any) {
    await this.emit('send', { scope, endpoint, content })
  }

  async proactive(scope: string, endpoint: Endpoint) {
    await this.emit('proactive', { scope, endpoint })
  }

  async receive(scope: string, endpoint: Endpoint, content: any) {
    await this.emit('receive', { scope, endpoint, content })
  }

  async stop(scope: string) {
    await this.emit('stop', { scope })
    await this.destroy(scope, this.get(scope))

    if (this.manager) {
      this.manager.del(scope)
    } else {
      delete this.states[scope]
    }
  }

  async destroy(scope: string, state: TState): Promise<void> {}

  public get(scope: string): TState {
    if (this.manager) {
      return this.manager.get(scope)
    } else {
      return this.states[scope]
    }
  }

  public prepareIndexResponse(scope: string, identity: string, sender: string, options: IndexChoiceOption[]) {
    this.cacheIndexResponses.set(this.getIndexCacheKey(scope, identity, sender), options)
  }

  public handleIndexResponse(scope: string, index: number, identity: string, sender: string): any | undefined {
    if (index) {
      const key = this.getIndexCacheKey(scope, identity, sender)
      const options = this.cacheIndexResponses.get(key)
      const option = options?.[index - 1]

      if (option) {
        if (option.type === IndexChoiceType.PostBack) {
          return { type: option.type, payload: option.value }
        } else if (option.type === IndexChoiceType.SaySomething) {
          return { type: option.type, text: option.value }
        } else if (option.type === IndexChoiceType.QuickReply) {
          return { type: option.type, text: option.title, payload: option.value }
        } else if (option.type === IndexChoiceType.OpenUrl) {
          return {}
        }
      }

      return undefined
    }
  }

  protected getIndexCacheKey(scope: string, identity: string, sender: string) {
    return `${scope}_${identity}_${sender}`
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

export interface ChannelProactiveEvent {
  scope: string
  endpoint: Endpoint
}

export interface ChannelReceiveEvent {
  scope: string
  endpoint: Endpoint
  content: any
}
