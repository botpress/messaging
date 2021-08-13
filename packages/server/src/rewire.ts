import Module from 'module'

// Rewires imports to target the source code of other modules when transpiling
if (process.env.TS_NODE_DEV) {
  const originalRequire = Module.prototype.require

  const rewire = function (this: NodeRequireFunction, mod: string) {
    if (mod.startsWith('@botpress')) {
      return originalRequire.apply(this, [mod + '/src'])
    }
    return originalRequire.apply(this, [mod])
  }

  Module.prototype.require = rewire
}
