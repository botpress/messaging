import { FrameworkEnv } from '@botpress/framework'

export type ServerEnv = FrameworkEnv & {
  DATA_PATH?: string
}

declare global {
  namespace NodeJS {
    interface ProcessEnv extends ServerEnv {}
  }
}
