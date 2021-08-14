export class WebchateLocale {
  public current!: string

  constructor() {
    this.current = navigator.language
  }

  async setup() {}

  getFamily() {
    return this.current?.split('-')[0]
  }
}
