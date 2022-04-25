import { uuid } from '@botpress/messaging-base'

export class Emitter<T extends { [key: string]: any }> {
  private listeners: { [eventId: string]: (((clientId: uuid, arg: any) => Promise<any>) | ((arg: any) => void))[] } = {}

  public on<K extends keyof T>(
    event: K,
    listener: ((clientId: uuid, arg: T[K]) => Promise<any>) | ((arg: T[K]) => void)
  ) {
    const listeners = this.listeners[event as string]
    if (!listeners) {
      this.listeners[event as string] = [listener]
    } else {
      listeners.push(listener)
    }
  }

  protected async emit<K extends keyof T>(event: K, clientId: uuid, arg: T[K]): Promise<boolean> {
    const listeners = this.listeners[event as string]
    if (listeners?.length) {
      for (const listener of listeners) {
        await listener(clientId, arg)
      }
      return true
    } else {
      return false
    }
  }
}

export class ProtectedEmitter<T extends { [key: string]: any }> {
  private listeners: { [eventId: string]: ((arg: any) => Promise<void>)[] } = {}

  public on<K extends keyof T>(event: K, listener: (arg: T[K]) => Promise<void>, pushBack: boolean = false) {
    const listeners = this.listeners[event as string]
    if (!listeners) {
      this.listeners[event as string] = [listener]
    } else if (!pushBack) {
      listeners.push(listener)
    } else {
      listeners.unshift(listener)
    }
  }

  protected async emit<K extends keyof T>(event: K, arg: T[K]): Promise<boolean> {
    const listeners = this.listeners[event as string]
    if (listeners?.length) {
      for (const listener of listeners) {
        await listener(arg)
      }
      return true
    } else {
      return false
    }
  }
}
