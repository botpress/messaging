export class WebchateLocale {
  public current!: string

  async setup() {
    this.current = navigator.language
  }
}
