import { Client } from '@botpress/nlu-client'

// TODO cleanup; move this somewhere
// might need to add clientId: string, clientSecret: string
// might also use the wrapper here instead packages/studio-be/src/studio/nlu/nlu-client/index.ts
export const getNLUServerClient = (): Client => {
  return new Client({
    baseURL: window.NLU_ENDPOINT
  })
}
