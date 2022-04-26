import { MultiLangText } from 'botpress/sdk'
import { isEmpty, merge } from 'lodash'

import { createIntl, createIntlCache } from 'react-intl'

import en from './en.json'
import es from './es.json'
import fr from './fr.json'

const defaultLocale = 'en'
const cache = createIntlCache()
let isDev = false

document.addEventListener('keydown', function (event) {
  if (event.ctrlKey && event.key === 'q') {
    isDev = !isDev
    localStorage.setItem('langdebug', isDev ? 'true' : 'false')
    ;(window as any).location.reload()
  }
})

const langExtend = (langs) => {
  if (isEmpty((window as any).translations)) {
    ;(window as any).translations = { en, fr, es }
  }

  for (const [key, value] of Object.entries(langs)) {
    if ((window as any).translations[key]) {
      merge((window as any).translations[key], value)
    } else {
      ;(window as any).translations[key] = value
    }
  }
}

const langInit = () => {
  ;(window as any).locale = getUserLocale()
  isDev = localStorage.getItem('langdebug') === 'true'

  const messages = squash((window as any).translations[(window as any).locale])
  const defaultLang = squash((window as any).translations[defaultLocale])
  for (const key in defaultLang) {
    if (!messages[key]) {
      messages[key] = defaultLang[key]
    }
  }

  ;(window as any).intl = createIntl(
    {
      locale: (window as any).locale,
      messages,
      defaultLocale,
      onError: (err) => {
        if (isDev) {
          console.error(err)
        }
      }
    },
    cache
  )
}

const langLocale = (): string => {
  return (window as any).locale
}

const langAvailable = (): string[] => {
  return Object.keys((window as any).translations)
}

const squash = (space, root = {}, path = '') => {
  for (const [key, value] of Object.entries(space)) {
    if (typeof value === 'object' && value !== null) {
      squash(value, root, `${path}${key}.`)
    } else {
      root[path + key] = value
    }
  }
  return root
}

const getUserLocale = () => {
  const code = (str) => str.split('-')[0]
  const browserLocale = code(navigator.language || navigator['userLanguage'] || '')
  const storageLocale = code(localStorage.getItem('uiLanguage') || '')

  return (window as any).translations[storageLocale]
    ? storageLocale
    : (window as any).translations[browserLocale]
    ? browserLocale
    : defaultLocale
}

/**
 * Can either receive an ID, or an object with keys of supported languages
 */
const translate = (id: string | MultiLangText, values?: { [variable: string]: any }): string => {
  if (!id) {
    return ''
  }

  if (typeof id === 'object') {
    return id[(window as any).locale] || id[defaultLocale] || ''
  }

  if (isDev) {
    return id
  } else {
    return (window as any).intl.formatMessage({ id }, values)
  }
}

export const lang = {
  tr: translate,
  init: langInit,
  extend: langExtend,
  getLocale: langLocale,
  getAvailable: langAvailable,
  defaultLocale
}
