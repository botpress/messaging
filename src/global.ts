export interface MessagingEnv {
  DATABASE_URL: string | undefined
  NODE_ENV: 'production' | undefined
}

declare global {
  namespace NodeJS {
    interface ProcessEnv extends MessagingEnv {}
  }
}
