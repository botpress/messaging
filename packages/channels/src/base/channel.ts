// This rule is completely bugged for this file
/* eslint-disable brace-style */
import { Router } from 'express'
import { ChannelApi, ChannelApiManager } from './api'
import { ChannelConfig } from './config'
import { Endpoint } from './endpoint'
import { Kvs } from './kvs'
import { Logger } from './logger'
import { ChannelMeta } from './meta'
import { ChannelProactiveEvent, ChannelReceiveEvent, ChannelService } from './service'
import { ChannelStream } from './stream'

export interface Channel {
  get meta(): ChannelMeta
  get scopes(): string[]
  get logger(): Logger | undefined
  set logger(logger: Logger | undefined)
  get kvs(): Kvs | undefined
  set kvs(kvs: Kvs | undefined)
  setup(router: Router, logger?: Logger): Promise<void>
  start(scope: string, config: any): Promise<void>
  initialize(scope: string): Promise<void>
  send(scope: string, endpoint: any, content: any): Promise<void>
  stop(scope: string): Promise<void>
  has(scope: string): boolean
  on<K extends keyof ChannelEvents>(
    event: K,
    listener: ((arg: ChannelEvents[K]) => Promise<void>) | ((arg: ChannelEvents[K]) => void)
  ): void
  autoStart(callback: (scope: string) => Promise<void>): void
  stateManager(manager: ChannelStateManager): void
  makeUrl(callback: (scope: string) => Promise<string>): void
}

export interface ChannelStateManager {
  set(scope: string, val: any): boolean
  get(scope: string): any
  del(scope: string): void
}

export abstract class ChannelTemplate<
  TConfig extends ChannelConfig,
  TService extends ChannelService<TConfig, any>,
  TApi extends ChannelApi<TService>,
  TStream extends ChannelStream<TService, any>
> implements Channel
{
  abstract get meta(): ChannelMeta

  get scopes() {
    return this.service.scopes
  }

  get logger(): Logger | undefined {
    return this.service.logger
  }

  set logger(logger: Logger | undefined) {
    this.service.logger = logger
  }

  get kvs(): Kvs | undefined {
    return this.service.kvs
  }

  set kvs(kvs: Kvs | undefined) {
    this.service.kvs = kvs
  }

  constructor(public readonly service: TService, public readonly api: TApi, public readonly stream: TStream) {}

  async setup(router: Router, logger?: Logger) {
    this.logger = logger
    await this.service.setup()
    await this.api.setup(new ChannelApiManager(this.service, router, logger))
    await this.stream.setup()
  }

  async start(scope: string, config: TConfig) {
    return this.service.start(scope, config)
  }

  async initialize(scope: string) {
    return this.service.initialize(scope)
  }

  async send(scope: string, endpoint: any, content: any) {
    return this.service.send(scope, endpoint, content)
  }

  async stop(scope: string) {
    return this.service.stop(scope)
  }

  has(scope: string) {
    return this.service.get(scope) !== undefined
  }

  public on<K extends keyof ChannelEvents>(
    event: K,
    listener: ((arg: ChannelEvents[K]) => Promise<void>) | ((arg: ChannelEvents[K]) => void)
  ) {
    if (event === 'message') {
      this.service.on('receive', listener as (arg: ChannelReceiveEvent) => void)
    } else if (event === 'proactive') {
      this.service.on('proactive', listener as (arg: ChannelProactiveEvent) => void)
    }
  }

  autoStart(callback: (scope: string) => Promise<void>) {
    this.service.autoStart(callback)
  }

  stateManager(manager: ChannelStateManager): void {
    this.service.stateManager(manager)
  }

  makeUrl(callback: (scope: string) => Promise<string>): void {
    return this.api.makeUrl(callback)
  }
}

export interface ChannelEvents {
  message: MessageEvent
  proactive: ProactiveEvent
}

export interface MessageEvent {
  scope: string
  endpoint: Endpoint
  content: any
}

export interface ProactiveEvent {
  scope: string
  endpoint: Endpoint
}
