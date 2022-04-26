export interface BPStorage {
  set: <T>(key: string, value: T) => void
  get: <T = string>(key: string) => T | undefined
  del: (key: string) => void
}

declare global {
  interface Window {
    BP_STORAGE: BPStorage
    USE_SESSION_STORAGE: boolean
  }
}
