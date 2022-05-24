import { FrameworkEnv } from '@botpress/messaging-framework'

export type MessagingEnv = FrameworkEnv & {
  TWILIO_TESTING?: string
  BILLING_ENDPOINT?: string
  ENABLE_BILLING_STATS?: string
}

declare global {
  namespace NodeJS {
    interface ProcessEnv extends MessagingEnv {}
    export interface Process {
      pkg: any
    }
  }
}
