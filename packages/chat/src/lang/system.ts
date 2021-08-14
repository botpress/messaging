import { WebchateLocale } from '../locale/system'

export class WebchatLang {
  private translations: { [lang: string]: any } = {}

  constructor(private locale: WebchateLocale) {}

  async setup() {}

  public extend(langs: any) {
    for (const [key, value] of Object.entries(langs)) {
      this.translations[key] = { ...(this.translations[key] || {}), ...this.squash(langs[key]) }
    }
  }

  private squash(space: any, root: any = {}, path: string = '') {
    for (const [key, value] of Object.entries(space)) {
      if (typeof value === 'object' && value !== null) {
        this.squash(value, root, `${path}${key}.`)
      } else {
        root[path + key] = value
      }
    }
    return root
  }

  public tr(id: string): string {
    return this.translations[this.locale.getFamily()]?.[id] || 'MISSING-TRANSLATION'
  }

  public date(date: Date | undefined): string {
    if (!date) {
      return 'ERROR-DATE'
    }

    return new Date(date).toLocaleTimeString(this.locale.current)
  }
}
