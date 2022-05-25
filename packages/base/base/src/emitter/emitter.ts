import { BaseEmitter } from './base'

export class Emitter<T extends { [key: string]: any }> extends BaseEmitter<T> {
  public on<K extends keyof T>(
    event: K,
    listener: ((arg: T[K]) => Promise<void>) | ((arg: T[K]) => void),
    pushBack: boolean = false
  ) {
    return this.sealedOn(event, listener, pushBack)
  }

  public async emit<K extends keyof T>(event: K, arg: T[K]): Promise<boolean> {
    return this.sealedEmit(event, arg)
  }
}
