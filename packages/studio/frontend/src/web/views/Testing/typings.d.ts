import { BPStorage } from '../../components/Shared/lite-utils/typings'

declare global {
  interface Window {
    __BP_VISITOR_ID: string
    botpressWebChat: {
      init: (config: any, containerSelector?: string) => void
      sendEvent: (payload: any, webchatId?: string) => void
      mergeConfig: (config: any) => void
      configure: (config: any) => void
      sendPayload: (payload: any) => void
    }
    BP_STORAGE: BPStorage
  }
}
