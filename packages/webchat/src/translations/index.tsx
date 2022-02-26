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
const USER_LANG_STORAGE_KEY = 'user-lang'
const translations: { [lang: string]: any } = { en, fr, pt, es, ar, ru, uk, de, it }

const rtlLocales = [
  'ae' /* Avestan */,
  'ar' /* 'العربية', Arabic */,
  'arc' /* Aramaic */,
  'bcc' /* 'بلوچی مکرانی', Southern Balochi */,
  'bqi' /* 'بختياري', Bakthiari */,
  'ckb' /* 'Soranî / کوردی', Sorani */,
  'dv' /* Dhivehi */,
  'fa' /* 'فارسی', Persian */,
  'glk' /* 'گیلکی', Gilaki */,
  'he' /* 'עברית', Hebrew */,
  'ku' /* 'Kurdî / كوردی', Kurdish */,
  'mzn' /* 'مازِرونی', Mazanderani */,
  'nqo' /* N'Ko */,
  'pnb' /* 'پنجابی', Western Punjabi */,
  'ps' /* 'پښتو', Pashto, */,
  'sd' /* 'سنڌي', Sindhi */,
  'ug' /* 'Uyghurche / ئۇيغۇرچە', Uyghur */,
  'ur' /* 'اردو', Urdu */,
  'yi' /* 'ייִדיש', Yiddish */
]
// 'en-US' becomes ['en', '-us'] 'en' becomes ['en']
const localeRegex = /^([a-zA-Z]{2,3})([_\-a-zA-Z]{3,5})$/

const cleanLanguageCode = (str: string) => str.split('-')[0]
const getNavigatorLanguage = () => cleanLanguageCode(navigator.language || (navigator as any)['userLanguage'] || '')
const getStorageLanguage = () => cleanLanguageCode(window.BP_STORAGE.get(USER_LANG_STORAGE_KEY) || '')
const setStorageLanguage = (locale: string) => window.BP_STORAGE.set(USER_LANG_STORAGE_KEY, locale)

// Desired precedence
// 1- manual locale = 'browser' : browser lang
// 2- manual locale is supported : manual lang
// 3- storage lang is supported : storage lang
// 4- browser lang is supported : browser lang
// 5- default lang
const getUserLocale = (manualLocale: Locale = '') => {
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

const setUserLocale = (locale: Locale) => {
  setStorageLanguage(locale)
}

const isRTLLocale = (locale?: string): boolean => {
  if (!locale) {
    return false
  }
  locale = locale.toLowerCase()
  const matches = localeRegex.exec(locale)

  if (!matches || matches.length < 2) {
    return false
  }

  return rtlLocales.includes(matches[1])
}

export { translations, DEFAULT_LOCALE as defaultLocale, getUserLocale, setUserLocale, isRTLLocale }
