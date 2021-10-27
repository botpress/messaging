import { uuid } from '@botpress/messaging-base'

export interface UserToken {
  id: uuid
  userId: uuid
  token: string
  expiry: Date | undefined
}
