import { BPStorage } from './components/Shared/lite-utils/typings'

// TODO: remove when at least one typing is exported from this file
export interface test {}

declare global {
  interface Window {
    __BP_VISITOR_ID: string
    __BP_VISITOR_SOCKET_ID: string
    __REDUX_DEVTOOLS_EXTENSION_COMPOSE__: any
    botpressWebChat: {
      init: (config: any, containerSelector?: string) => void
      sendEvent: (payload: any, webchatId?: string) => void
      mergeConfig: (config: any) => void
      configure: (config: any) => void
      sendPayload: (payload: any) => void
    }
    APP_NAME: string
    APP_FAVICON: string
    APP_CUSTOM_CSS: string
    BOT_API_PATH: string
    API_PATH: string
    SEGMENT_WRITE_KEY: string

    ROOT_PATH: string
    BOT_ID: string
    BP_BASE_PATH: string
    SEND_USAGE_STATS: boolean
    IS_STANDALONE: boolean
    IS_BOT_MOUNTED: boolean
    BOT_LOCKED: boolean
    SOCKET_TRANSPORTS: string[]
    /** When the studio runs as a standalone, this is the URL of the runtime  */
    BP_SERVER_URL: string
    ANALYTICS_ID: string
    UUID: string
    BP_STORAGE: BPStorage
    EXPERIMENTAL: boolean
    USE_SESSION_STORAGE: boolean
    NLU_ENDPOINT: string
    botpress: {
      [moduleName: string]: any
    }
    TELEMETRY_URL: string
    toggleSidePanel: () => void
  }
}
