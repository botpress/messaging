import * as espree from 'espree'
import memoize from 'fast-memoize'

import { DELIM_START, DELIM_END } from '../config'
import jsRange from './jsRange'

const sandboxProxies = new WeakMap()

function has(target: any, key: any) {
  return true
}

function get(target: any, key: any) {
  if (key === Symbol.unscopables) {
    return undefined
  }
  return target[key]
}

function _evalToken(token: string, vars: any) {
  token = token.replace(/ /g, '').replace(/;/g, '')
  if (!token) {
    return undefined
  }
  if (!verifyJs(token)) {
    return undefined
  }

  const src = 'with(sandbox){try{return(' + token + ')}catch(e){return(e)}}'
  try {
    // eslint-disable-next-line no-new-func
    const code = new Function('sandbox', src)

    return (function (sandbox) {
      if (!sandboxProxies.has(sandbox)) {
        const sandboxProxy = new Proxy(sandbox, { has, get })
        sandboxProxies.set(sandbox, sandboxProxy)
      }
      return code(sandboxProxies.get(sandbox))
    })(vars)
  } catch (e) {
    return undefined
  }
}
export const evalToken = memoize(_evalToken)

export function isError(str: string): boolean {
  str = String(str)
  return str.startsWith('TypeError') || str.startsWith('Error')
}

export function verifyJs(js: string): boolean {
  try {
    espree.parse(js)
    return true
  } catch {
    return false
  }
}

export function rmDelim(str: string) {
  return str.replace(DELIM_START, '').replace(DELIM_END, '')
}

export function evalStrTempl(str: string, vars: any = {}) {
  let invalid = null

  const matches = jsRange(str)
  if (!matches) {
    return str
  }

  matches.forEach((m) => {
    let out = rmDelim(m)
    out = evalToken(out, vars)
    if (!out) {
      invalid = `Error: ${m} evaluated to undefined`
    }
    out = String(out)
    if (isError(out)) {
      invalid = out
    }

    str = str.replace(m, out)
  })

  return invalid ? invalid : str
}
