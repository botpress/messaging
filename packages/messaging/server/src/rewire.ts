import Module from 'module'

// Rewires imports to target the source code of other modules when transpiling
if (process.env.TS_NODE_DEV) {
  const originalRequire = Module.prototype.require as (id: string) => any

  const rewire = function (this: (id: string) => any, mod: string) {
    if (
      mod.startsWith('@botpress/messaging') &&
      // we don't want to rewire the legacy channels because we get them from npm
      mod !== '@botpress/messaging-channels-legacy'
    ) {
      return originalRequire.apply(this, [mod + '/src'])
    }
    return originalRequire.apply(this, [mod])
  }

  Module.prototype.require = rewire as any
}
