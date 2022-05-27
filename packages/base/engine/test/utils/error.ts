import { ShutDownSignal } from '../../src'

// TODO: This code was copied from the migration test utils of the messaging server.
// Note: it cannot currently cannot go in the test package since it would make it depend on the engine package.
export const handleShutDownSignal = async <T>(fn: () => PromiseLike<T>, { expectedCode } = { expectedCode: 0 }) => {
  try {
    await fn()
  } catch (e) {
    if (!(e instanceof ShutDownSignal)) {
      throw e
    } else if (e.code && e.code !== expectedCode) {
      throw new Error(`Process exited with a non zero error code: ${e.code}`)
    }
  }
}
