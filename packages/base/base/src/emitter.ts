export class Emitter<T extends { [key: string]: any }> {
  private listeners: { [eventId: number]: (((arg: any) => Promise<void>) | ((arg: any) => void))[] } = {}

  public on<K extends keyof T>(
    event: K,
    listener: ((arg: T[K]) => Promise<void>) | ((arg: T[K]) => void),
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

  public async emit<K extends keyof T>(event: K, arg: T[K]): Promise<boolean> {
    const listeners = this.listeners[event as number]
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

export class ProtectedEmitter<T extends { [key: string]: any }> {
  private listeners: { [eventId: number]: (((arg: any) => Promise<void>) | ((arg: any) => void))[] } = {}

  public on<K extends keyof T>(
    event: K,
    listener: ((arg: T[K]) => Promise<void>) | ((arg: T[K]) => void),
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

  public removeListeners<K extends keyof T>(event: K) {
    this.listeners[event as number] = []
  }

  protected async emit<K extends keyof T>(event: K, arg: T[K]): Promise<boolean> {
    const listeners = this.listeners[event as number]
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

export class ProtectedScopedEmitter<T extends { [key: string]: any }> {
  private listeners: {
    [eventId: string]: (((scope: string, arg: any) => Promise<any>) | ((scope: string, arg: any) => void))[]
  } = {}

  public on<K extends keyof T>(
    event: K,
    listener: ((scope: string, arg: T[K]) => Promise<any>) | ((scope: string, arg: T[K]) => void)
  ) {
    const listeners = this.listeners[event as string]
    if (!listeners) {
      this.listeners[event as string] = [listener]
    } else {
      listeners.push(listener)
    }
  }

  protected async emit<K extends keyof T>(event: K, scope: string, arg: T[K]): Promise<boolean> {
    const listeners = this.listeners[event as string]
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
