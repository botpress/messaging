import { DistributedService } from '..'

const SCOPE_SEPERATOR = '::'

export class Dispatcher<T extends { [key: number]: any }> {
  private name!: string
  private distributed!: DistributedService

  private listeners: { [eventId: number]: ((scope: string, arg: any) => Promise<void>)[] } = {}
  private handleDispatchCallback!: (msg: any, channel: string) => Promise<void>

  async setup(name: string, distributed: DistributedService) {
    this.name = name
    this.distributed = distributed
    this.handleDispatchCallback = this.handleDispatch.bind(this)
  }

  async subscribe(scope: string) {
    await this.distributed.subscribe(this.getChannel(scope), this.handleDispatchCallback)
  }

  async unsubscribe(scope: string) {
    await this.distributed.unsubscribe(this.getChannel(scope))
  }

  async publish<K extends keyof T>(event: K, scope: string, arg: T[K]) {
    await this.emit(event, scope, arg)
    await this.distributed.publish(this.getChannel(scope), {
      cmd: event,
      data: arg
    })
  }

  private getChannel(scope: string) {
    return `${this.name}${SCOPE_SEPERATOR}${scope}`
  }

  private async handleDispatch<K extends keyof T>({ cmd, data }: { cmd: K; data: T[K] }, channel: string) {
    const scopeStart = channel.lastIndexOf(SCOPE_SEPERATOR)
    const scope = channel.substr(scopeStart + SCOPE_SEPERATOR.length)
    await this.emit(cmd, scope, data)
  }

  public on<K extends keyof T>(
    event: K,
    listener: (scope: string, arg: T[K]) => Promise<void>,
    pushBack: boolean = false
  ) {
    const listeners = this.listeners[event as number]
    if (!listeners) {
      this.listeners[event as number] = [listener]
    } else if (!pushBack) {
      listeners.push(listener)
    } else {
      listeners.unshift(listener)
    }
  }

  private async emit<K extends keyof T>(event: K, scope: string, arg: T[K]): Promise<boolean> {
    const listeners = this.listeners[event as number]
    if (listeners?.length) {
      for (const listener of listeners) {
        await listener(scope, arg)
      }
      return true
    } else {
      return false
    }
  }
}
