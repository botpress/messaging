import { EngineEnv } from '@botpress/messaging-engine'

export type FrameworkEnv = EngineEnv & {
  PORT?: string
  EXTERNAL_URL?: string
  INTERNAL_PASSWORD?: string
  ADMIN_KEY?: string
  APM_ENABLED?: string
  NO_LOGO?: string
  SKIP_LOAD_ENV?: string
}

declare global {
  namespace NodeJS {
    interface ProcessEnv extends FrameworkEnv {}
    export interface Process {
      pkg: any
    }
  }
}
