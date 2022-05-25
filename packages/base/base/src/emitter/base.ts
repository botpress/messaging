export class BaseEmitter<T extends { [key: string]: any }> {
  protected listeners: { [eventId: number]: (((arg: any) => Promise<void>) | ((arg: any) => void))[] } = {}

  protected sealedOn<K extends keyof T>(
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

  protected async sealedEmit<K extends keyof T>(event: K, arg: T[K]): Promise<boolean> {
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
