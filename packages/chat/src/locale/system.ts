export class WebchateLocale {
  public current!: string

  setup() {
    this.current = navigator.language
  }
}
