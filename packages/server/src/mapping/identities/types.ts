import { uuid } from '@botpress/messaging-base'

export interface Identity {
  id: uuid
  tunnelId: uuid
  name: string
}
