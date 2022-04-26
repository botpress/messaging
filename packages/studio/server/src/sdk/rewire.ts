import Module from 'module'
import syspath from 'path'

const originalRequire = Module.prototype.require

const rewire = function (this: NodeRequireFunction, mod: string) {
  if (mod === 'botpress/sdk') {
    return originalRequire.apply(this, [syspath.resolve(__dirname, './sdk_impl')])
  }

  return originalRequire.apply(this, arguments as never as [string])
}

Module.prototype.require = rewire as any
