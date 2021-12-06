require('@formatjs/intl-pluralrules/polyfill')
require('@formatjs/intl-pluralrules/locale-data/ar')
require('@formatjs/intl-pluralrules/locale-data/de')
require('@formatjs/intl-pluralrules/locale-data/en')
require('@formatjs/intl-pluralrules/locale-data/es')
require('@formatjs/intl-pluralrules/locale-data/fr')
require('@formatjs/intl-pluralrules/locale-data/it')
require('@formatjs/intl-pluralrules/locale-data/pt')
require('@formatjs/intl-pluralrules/locale-data/ru')
require('@formatjs/intl-pluralrules/locale-data/uk')

import ar from './ar.json'
import de from './de.json'
import en from './en.json'
import es from './es.json'
import fr from './fr.json'
import it from './it.json'
import pt from './pt.json'
import ru from './ru.json'
import uk from './uk.json'

type Locale = 'browser' | string

const DEFAULT_LOCALE = 'en'
const STORAGE_KEY = 'bp/channel-web/user-lang'
const translations: { [lang: string]: any } = { en, fr, pt, es, ar, ru, uk, de, it }

const cleanLanguageCode = (str: string) => str.split('-')[0]
const getNavigatorLanguage = () => cleanLanguageCode(navigator.language || (navigator as any)['userLanguage'] || '')
const getStorageLanguage = () => cleanLanguageCode(window.BP_STORAGE?.get(STORAGE_KEY) || '')

// Desired precedence
// 1- manual locale = 'browser' : browser lang
// 2- manual locale is supported : manual lang
// 3- storage lang is supported : storage lang
// 4- browser lang is supported : browser lang
// 5- default lang
const getUserLocale = (manualLocale: Locale = 'browser') => {
  const browserLocale = getNavigatorLanguage()
  if (manualLocale === 'browser' && translations[browserLocale]) {
    return browserLocale
  }

  manualLocale = cleanLanguageCode(manualLocale)
  if (translations[manualLocale]) {
    return manualLocale
  }

  const storageLocale = getStorageLanguage()
  if (translations[storageLocale]) {
    return storageLocale
  }

  return translations[browserLocale] ? browserLocale : DEFAULT_LOCALE
}

export { translations, DEFAULT_LOCALE as defaultLocale, getUserLocale }
