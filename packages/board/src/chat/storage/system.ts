import { WebchatSystem } from '../base/system'

export class WebchatStorage extends WebchatSystem {
  public get<T>(key: string): T | undefined {
    const stored = localStorage.getItem(this.getKey(key))
    if (!stored) {
      return undefined
    }

    try {
      const val = JSON.parse(stored)
      return val
    } catch {
      return undefined
    }
  }

  public set<T>(key: string, object: T) {
    localStorage.setItem(this.getKey(key), JSON.stringify(object))
  }

  private getKey(key: string) {
    return `bp-chat-${key}`
  }
}
