export class Emitter<T extends { [key: number]: any }> {
  private listeners: { [eventId: number]: (((arg: any) => Promise<void>) | ((arg: any) => void))[] } = {}

  public on<K extends keyof T>(event: K, listener: ((arg: T[K]) => Promise<void>) | ((arg: T[K]) => void)) {
    const listeners = this.listeners[event as number]
    if (!listeners) {
      this.listeners[event as number] = [listener]
    } else {
      listeners.push(listener)
    }
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
