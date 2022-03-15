import { EngineEnv } from '@botpress/messaging-engine'

export type FrameworkEnv = EngineEnv & {}

declare global {
  namespace NodeJS {
    interface ProcessEnv extends FrameworkEnv {}
    export interface Process {
      pkg: any
    }
  }
}
