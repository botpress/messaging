import { WebchatSystem } from '../base/system'
import { WebchateLocale } from '../locale/system'

export class WebchatLang extends WebchatSystem {
  private translations: { [lang: string]: Translation } = {}

  constructor(private locale: WebchateLocale) {
    super()
  }

  public extend(langs: { [lang: string]: RecursiveTranslation }) {
    for (const [key, value] of Object.entries(langs)) {
      this.translations[key] = { ...(this.translations[key] || {}), ...this.squash(value) }
    }
  }

  private squash(space: RecursiveTranslation, root: Translation = {}, path: string = '') {
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

export interface RecursiveTranslation {
  [key: string]: string | RecursiveTranslation
}

export interface Translation {
  [key: string]: string | undefined
}
