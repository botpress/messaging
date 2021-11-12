import Module from 'module'

// Rewires imports to target the source code of other modules when transpiling
if (process.env.TS_NODE_DEV) {
  const originalRequire = Module.prototype.require

  const rewire = function (this: NodeJS.Require, mod: string) {
    if (mod.startsWith('@botpress')) {
      // TODO: fix this
      // @ts-ignore
      return originalRequire.apply(this, [mod + '/src'])
    }
    // @ts-ignore
    return originalRequire.apply(this, [mod])
  }

  // @ts-ignore
  Module.prototype.require = rewire
}
