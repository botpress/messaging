import { ServerCache2D } from '../caching/cache2D'

export class Barrier2D<T> {
  constructor(private id: string, private locks: ServerCache2D<Promise<T>>) {}

  async once(keyX: string, keyY: string, callback: () => Promise<T>): Promise<T> {
    let promise = this.locks.get(keyX, keyY)

    if (!promise) {
      let resolve: (value: T) => void
      promise = new Promise(async (r) => {
        resolve = r
      })

      this.locks.set(keyX, keyY, promise)
      resolve!(await callback())
    }

    return promise
  }
}
