import crypto from 'crypto'
import globrex from 'globrex'
import _ from 'lodash'

const getCircularReplacer = () => {
  const seen = new WeakSet()
  return (_key, value) => {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) {
        return '[cyclic reference]'
      }
      seen.add(value)
    }
    return value
  }
}

export const safeStringify = (obj: any, spaces?: number) => JSON.stringify(obj, getCircularReplacer(), spaces || 0)

export const stringify = (content) => JSON.stringify(content, undefined, 2)

export const forceForwardSlashes = (path) => path.replace(/\\/g, '/')

export const getCacheKeyInMinutes = (minutes: number = 1) => Math.round(new Date().getTime() / 1000 / 60 / minutes)

/** Case-insensitive "startsWith" */
export const startsWithI = (a: string, b: string) => a.toLowerCase().startsWith(b.toLowerCase())
export const asBytes = (size: string) => {
  if (typeof size === 'number') {
    return size
  }

  size = typeof size === 'string' ? size : '0'

  const matches = size
    .replace(',', '.')
    .toLowerCase()
    .match(/(\d+\.?\d{0,})\s{0,}(mb|gb|pt|kb|b)?/i)

  if (!matches || !matches.length) {
    return 0
  }

  /**/ if (matches[2] === 'b') {
    return Number(matches[1]) * Math.pow(1024, 0)
  } else if (matches[2] === 'kb') {
    return Number(matches[1]) * Math.pow(1024, 1)
  } else if (matches[2] === 'mb') {
    return Number(matches[1]) * Math.pow(1024, 2)
  } else if (matches[2] === 'gb') {
    return Number(matches[1]) * Math.pow(1024, 3)
  } else if (matches[2] === 'tb') {
    return Number(matches[1]) * Math.pow(1024, 4)
  }

  return Number(matches[1])
}

export function filterByGlobs<T>(array: T[], iteratee: (value: T) => string, globs: string[]): T[] {
  const rules: { regex: RegExp }[] = globs.map((g) => globrex(g, { globstar: true }))

  return array.filter((x) => _.every(rules, (rule) => !rule.regex.test(iteratee(x))))
}

export const calculateHash = (content: string) => crypto.createHash('sha256').update(content).digest('hex')

const regex = {
  illegalFile: /[\/\?<>\\:\*\|"]/g,
  illegalFolder: /[\?<>\\:\*\|"]/g,
  control: /[\x00-\x1f\x80-\x9f]/g,
  reserved: /^\.+$/
}

export const sanitize = (input: string, type?: 'file' | 'folder') => {
  return input
    .replace(regex.control, '')
    .replace(regex.reserved, '')
    .replace(type === 'folder' ? regex.illegalFolder : regex.illegalFile, '')
}

export const sanitizeFileName = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/\.json$/i, '')
    .replace(/[\t\s]/gi, '-')
}

export const getErrorMessage = (error: Error | string | unknown): string => {
  if (typeof error === 'string') {
    return error
  }

  if (error instanceof Error) {
    return error.message
  }

  return ''
}
