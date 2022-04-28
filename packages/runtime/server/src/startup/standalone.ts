global['NativePromise'] = global.Promise

import 'reflect-metadata'
import { loadEnvVars, setupErrorHandlers, setupProcessVars } from './misc'

setupErrorHandlers()
setupProcessVars()
loadEnvVars()

try {
  require('./cli')
} catch (err) {
  global.printErrorDefault(err)
}
