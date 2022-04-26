import Module from 'module'
import syspath from 'path'

const originalRequire = Module.prototype.require as (id: string) => any

const rewire = function (this: (id: string) => any, mod: string) {
  if (mod === 'botpress/sdk') {
    return originalRequire.apply(this, [syspath.resolve(__dirname, './sdk_impl')])
  } else if (
    process.env.TS_NODE_DEV &&
    mod.startsWith('@botpress') &&
    // we don't want to rewire this external dep
    mod !== '@botpress/nlu-client'
  ) {
    return originalRequire.apply(this, [mod + '/src'])
  }

  return originalRequire.apply(this, [mod])
}

Module.prototype.require = rewire as any
