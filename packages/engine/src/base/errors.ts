export class ShutDownSignal extends Error {
  constructor(public readonly code?: number) {
    super()
  }
}
