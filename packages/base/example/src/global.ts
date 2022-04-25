import { FrameworkEnv } from '@botpress/messaging-framework'

export type ServerEnv = FrameworkEnv & {}

declare global {
  namespace NodeJS {
    interface ProcessEnv extends ServerEnv {}
  }
}
