const debug = require('debug')

const available: { [name: string]: boolean } = {}

export const Debug = (mod: string, base = 'bp:studio') => {
  const namespace = base + ':' + mod
  available[namespace] = true
  const instance = debug(base).extend(mod)
  instance.sub = (mod: string) => Debug(mod, namespace)
  instance.forBot = (botId: string, message: string, extra?: any) => {
    if (extra) {
      return instance(`(${botId}) ${message}`, extra, { botId })
    } else {
      return instance(`(${botId}) ${message}`, { botId })
    }
  }
  return instance
}

export const getDebugScopes = () => {
  const status: { [key: string]: any } = {}
  Object.keys(available).forEach((key) => (status[key] = debug.enabled(key)))
  return status
}

export const setDebugScopes = (scopes: string) => {
  debug.disable()
  debug.enable(scopes)
}

debug.log = function (...args: any[]) {
  const botId = (args[0] && args[0].botId) || (args[1] && args[1].botId) || (args[2] && args[2].botId)
  if (botId) {
    global.printBotLog(botId, args)
  } else {
    global.printLog(args)
  }
}
