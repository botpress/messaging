import { EngineEnv } from '@botpress/messaging-engine'

export type MessagingEnv = EngineEnv & {
  PORT?: string
  EXTERNAL_URL?: string
  INTERNAL_PASSWORD?: string
  SYNC?: string
  SKIP_LOAD_ENV?: string
  SPINNED?: string
  SPINNED_URL?: string
  NO_LAZY_LOADING?: string
  NO_LOGO?: string
  APM_ENABLED?: string
  TWILIO_TESTING?: string
}

declare global {
  namespace NodeJS {
    interface ProcessEnv extends MessagingEnv {}
    export interface Process {
      pkg: any
    }
  }
}
