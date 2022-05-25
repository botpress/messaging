import { BaseEmitter } from './base'

export class ProtectedEmitter<T extends { [key: string]: any }> extends BaseEmitter<T> {
  public on<K extends keyof T>(
    event: K,
    listener: ((arg: T[K]) => Promise<void>) | ((arg: T[K]) => void),
    pushBack: boolean = false
  ) {
    return this.sealedOn(event, listener, pushBack)
  }

  public removeListeners<K extends keyof T>(event: K) {
    this.listeners[event as number] = []
  }
}
