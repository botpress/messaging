import { uuid } from '@botpress/base'

export interface UserToken {
  id: uuid
  userId: uuid
  token: string
  expiry: Date | undefined
}
