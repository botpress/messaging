import Module from 'module'
import path from 'path'

// Rewires imports to target the source code of other modules when transpiling
if (process.env.TS_NODE_DEV) {
  const originalRequire = Module.prototype.require as (id: string) => any

  const rewire = function (this: (id: string) => any, mod: string) {
    if (mod === 'botpress/sdk' || mod === 'botpress/runtime-sdk') {
      return originalRequire.apply(this, [path.resolve(__dirname, './runtime/app/sdk_impl')])
    } else if (
      mod.startsWith('@botpress') &&
      // we don't want to rewire this external dep
      mod !== '@botpress/nlu-client'
    ) {
      return originalRequire.apply(this, [mod + '/src'])
    }
    return originalRequire.apply(this, [mod])
  }

  Module.prototype.require = rewire as any
}
