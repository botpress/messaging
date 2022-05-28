import { FrameworkEnv } from '@botpress/framework'

export type ServerEnv = FrameworkEnv & {}

declare global {
  namespace NodeJS {
    interface ProcessEnv extends ServerEnv {}
  }
}
