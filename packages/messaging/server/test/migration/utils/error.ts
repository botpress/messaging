import { ShutDownSignal } from '@botpress/messaging-engine'

export const handleShutDownSignal = async <T>(fn: () => PromiseLike<T>) => {
  try {
    await fn()
  } catch (e) {
    if (!(e instanceof ShutDownSignal)) {
      throw e
    } else if (e.code && e.code > 0) {
      throw new Error(`Process exited with a non zero error code: ${e.code}`)
    }
  }
}
