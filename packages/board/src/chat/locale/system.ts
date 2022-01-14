import { WebchatSystem } from '../base/system'

export class WebchateLocale extends WebchatSystem {
  public current!: string

  constructor() {
    super()
    this.current = navigator.language
  }

  getFamily() {
    return this.current?.split('-')[0]
  }
}
